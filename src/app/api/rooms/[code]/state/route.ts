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
          number: true
        }
      },
      updatedAt: true
    }
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room);
}
