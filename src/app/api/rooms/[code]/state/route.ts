import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { normalizeRoomCode } from "@/lib/game/room-code";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = await prisma.room.findUnique({
    where: { code: normalizeRoomCode(code) },
    select: {
      code: true,
      phase: true,
      currentRoundId: true,
      currentRound: {
        select: {
          number: true,
          clues: {
            select: { id: true, value: true, createdAt: true },
            orderBy: { id: "asc" }
          },
          votes: {
            select: { id: true, kind: true, targetPlayerId: true, createdAt: true },
            orderBy: { id: "asc" }
          }
        }
      },
      players: {
        select: { id: true, status: true, updatedAt: true },
        orderBy: { id: "asc" }
      },
      updatedAt: true
    }
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const stateRevision = createHash("sha256").update(JSON.stringify({
    roomUpdatedAt: room.updatedAt,
    players: room.players,
    clues: room.currentRound?.clues ?? [],
    votes: room.currentRound?.votes ?? []
  })).digest("hex");

  return NextResponse.json(
    {
      code: room.code,
      phase: room.phase,
      currentRoundId: room.currentRoundId,
      currentRound: room.currentRound ? { number: room.currentRound.number } : null,
      updatedAt: `${room.updatedAt.toISOString()}:${stateRevision}`
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    }
  );
}
