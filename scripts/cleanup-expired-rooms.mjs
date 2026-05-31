import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ROOM_CLEANUP_BATCH_SIZE = 100;
const IN_PROGRESS_PHASES = new Set([
  "REVEAL",
  "OFFLINE_DISCUSSION",
  "CLUE_SUBMISSION",
  "CLUE_REVIEW",
  "VOTING",
  "RESULTS"
]);

async function cleanupExpiredRooms() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - ROOM_TTL_MS);

  const candidates = await prisma.room.findMany({
    where: {
      // Never consider rooms less than 24 hours old, even if expiresAt was
      // accidentally set to an earlier value.
      createdAt: { lte: cutoff },
      expiresAt: { lte: now }
    },
    select: {
      id: true,
      phase: true,
      updatedAt: true
    },
    orderBy: { expiresAt: "asc" },
    take: MAX_ROOM_CLEANUP_BATCH_SIZE + 1
  });

  const capped = candidates.length > MAX_ROOM_CLEANUP_BATCH_SIZE;
  const scannedRooms = candidates.slice(0, MAX_ROOM_CLEANUP_BATCH_SIZE);
  const roomsToDelete = scannedRooms.filter((room) => {
    const isRecentlyActive = room.updatedAt > cutoff;
    const isGameInProgress = IN_PROGRESS_PHASES.has(room.phase);

    // In-progress games with recent activity are active and must not be
    // deleted. Abandoned games become eligible after 24 hours without updates.
    return !isGameInProgress || !isRecentlyActive;
  });

  if (capped) {
    console.warn(`Expired room cleanup capped at ${MAX_ROOM_CLEANUP_BATCH_SIZE} rooms; more expired rooms remain`);
  }

  if (roomsToDelete.length === 0) {
    console.log("No expired rooms found");
    return;
  }

  const deletedRooms = await prisma.room.deleteMany({
    where: {
      id: { in: roomsToDelete.map((room) => room.id) },
      // Repeat the age guard during deletion to keep repeated runs safe.
      createdAt: { lte: cutoff },
      expiresAt: { lte: now }
    }
  });

  console.log(`Deleted ${deletedRooms.count} expired rooms`);
}

try {
  await cleanupExpiredRooms();
} catch (error) {
  console.error("Expired room cleanup failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
