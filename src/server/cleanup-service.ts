import { prisma } from "@/lib/prisma";
import type { PrismaClient, RoomPhase } from "@prisma/client";

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ROOM_CLEANUP_BATCH_SIZE = 100;
const IN_PROGRESS_PHASES: RoomPhase[] = [
  "REVEAL",
  "OFFLINE_DISCUSSION",
  "CLUE_SUBMISSION",
  "CLUE_REVIEW",
  "VOTING",
  "RESULTS"
];

type CleanupOptions = {
  now?: Date;
  limit?: number;
  logger?: Pick<Console, "log" | "error" | "warn">;
};

type CleanupResult = {
  deletedCount: number;
  scannedCount: number;
  skippedActiveCount: number;
  capped: boolean;
};

export function getRoomExpirationDate(createdAt: Date) {
  return new Date(createdAt.getTime() + ROOM_TTL_MS);
}

export async function cleanupExpiredRooms(
  client: PrismaClient = prisma,
  options: CleanupOptions = {}
): Promise<CleanupResult> {
  const now = options.now ?? new Date();
  const cutoff = new Date(now.getTime() - ROOM_TTL_MS);
  const limit = Math.min(options.limit ?? MAX_ROOM_CLEANUP_BATCH_SIZE, MAX_ROOM_CLEANUP_BATCH_SIZE);
  const logger = options.logger ?? console;

  try {
    const candidates = await client.room.findMany({
      where: {
        // Safety belt: never consider rooms less than 24 hours old, even if
        // expiresAt was accidentally set to an earlier value.
        createdAt: { lte: cutoff },
        expiresAt: { lte: now }
      },
      select: {
        id: true,
        phase: true,
        updatedAt: true
      },
      orderBy: { expiresAt: "asc" },
      take: limit + 1
    });

    const capped = candidates.length > limit;
    const scannedRooms = candidates.slice(0, limit);
    const roomsToDelete = scannedRooms.filter((room) => {
      const isRecentlyActive = room.updatedAt > cutoff;
      const isGameInProgress = IN_PROGRESS_PHASES.includes(room.phase);

      // A room in an active game phase is kept while it has had activity in
      // the last 24 hours. Abandoned games eventually become eligible.
      return !isGameInProgress || !isRecentlyActive;
    });

    if (capped) {
      logger.warn(`Expired room cleanup capped at ${limit} rooms; more expired rooms remain`);
    }

    if (roomsToDelete.length === 0) {
      logger.log("No expired rooms found");
      return {
        deletedCount: 0,
        scannedCount: scannedRooms.length,
        skippedActiveCount: scannedRooms.length,
        capped
      };
    }

    const deletedRooms = await client.room.deleteMany({
      where: {
        id: { in: roomsToDelete.map((room) => room.id) },
        // Repeat the age guard in the delete itself so a stale candidate list
        // cannot delete a newly-created or manually extended room.
        createdAt: { lte: cutoff },
        expiresAt: { lte: now }
      }
    });

    logger.log(`Deleted ${deletedRooms.count} expired rooms`);

    return {
      deletedCount: deletedRooms.count,
      scannedCount: scannedRooms.length,
      skippedActiveCount: scannedRooms.length - roomsToDelete.length,
      capped
    };
  } catch (error) {
    logger.error("Expired room cleanup failed", error);
    throw error;
  }
}
