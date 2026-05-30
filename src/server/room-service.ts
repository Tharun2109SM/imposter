import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createShuffleSeed, hashSeed } from "@/lib/game/random";
import { createRoomCode, normalizeRoomCode } from "@/lib/game/room-code";
import { assignWords } from "@/lib/game/assignment";
import { playerNameSchema, roomSettingsSchema, wordPairSchema } from "@/lib/game/validation";
import { clueSchema } from "@/lib/game/validation";
import { emitRoomUpdate } from "@/lib/realtime";
import type { Player, WordPair } from "@/lib/game/types";

const defaultPairs = [
  { normalWord: "Tea", imposterWord: "Coffee", position: 0 },
  { normalWord: "Batman", imposterWord: "Superman", position: 1 },
  { normalWord: "Book", imposterWord: "Kindle", position: 2 }
];

export async function createRoom(hostNameValue: string) {
  const hostName = playerNameSchema.parse(hostNameValue);
  let roomCode = createRoomCode();

  for (let attempts = 0; attempts < 5; attempts += 1) {
    const existing = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!existing) break;
    roomCode = createRoomCode();
  }

  const room = await prisma.room.create({
    data: {
      code: roomCode,
      players: {
        create: {
          name: hostName,
          isHost: true
        }
      },
      wordPairs: {
        create: defaultPairs
      }
    },
    include: { players: true }
  });

  const host = room.players[0];
  await prisma.room.update({
    where: { id: room.id },
    data: { hostPlayerId: host.id }
  });

  redirect(`/room/${room.code}?player=${host.id}`);
}

export async function joinRoom(codeValue: string, playerNameValue: string) {
  const code = normalizeRoomCode(codeValue);
  const playerName = playerNameSchema.parse(playerNameValue);
  const room = await prisma.room.findUnique({ where: { code } });

  if (!room) {
    throw new Error("We couldn't find a room with that code. Check for typos!");
  }

  const player = await prisma.player.upsert({
    where: {
      roomId_name: {
        roomId: room.id,
        name: playerName
      }
    },
    update: { status: "CONNECTED" },
    create: {
      roomId: room.id,
      name: playerName
    }
  });

  emitRoomUpdate(room.code);
  redirect(`/room/${room.code}?player=${player.id}`);
}

export async function getRoom(code: string) {
  return prisma.room.findUnique({
    where: { code: normalizeRoomCode(code) },
    include: {
      players: { orderBy: [{ isHost: "desc" }, { joinedAt: "asc" }] },
      wordPairs: { orderBy: { position: "asc" } },
      currentRound: {
        include: {
          wordPair: true,
          assignments: { include: { player: true } },
          clues: { include: { player: true } },
          votes: true
        }
      }
    }
  });
}

export async function getGameRoom(code: string, playerId?: string) {
  const normalizedCode = normalizeRoomCode(code);
  const roomIdentity = await prisma.room.findUnique({
    where: { code: normalizedCode },
    select: {
      hostPlayerId: true,
      phase: true,
      currentRoundId: true
    }
  });

  if (!roomIdentity || !roomIdentity.currentRoundId) {
    return getRoom(code);
  }

  const isHost = playerId ? roomIdentity.hostPlayerId === playerId : true;
  const canSeeFullRound = isHost || roomIdentity.phase === "RESULTS" || roomIdentity.phase === "ENDED";

  if (canSeeFullRound) {
    return getRoom(code);
  }

  const room = await prisma.room.findUnique({
    where: { code: normalizedCode },
    include: {
      players: { orderBy: [{ isHost: "desc" }, { joinedAt: "asc" }] },
      wordPairs: {
        select: {
          id: true,
          roomId: true,
          position: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { position: "asc" }
      },
      currentRound: {
        include: {
          wordPair: {
            select: {
              id: true,
              roomId: true,
              position: true,
              createdAt: true,
              updatedAt: true
            }
          },
          assignments: {
            where: { playerId },
            include: { player: true }
          },
          clues: { include: { player: true } },
          votes: true
        }
      }
    }
  });

  if (!room) {
    return null;
  }

  return {
    ...room,
    wordPairs: room.wordPairs.map((pair) => ({
      ...pair,
      normalWord: "",
      imposterWord: ""
    })),
    currentRound: room.currentRound
      ? {
          ...room.currentRound,
          wordPair: {
            ...room.currentRound.wordPair,
            normalWord: "",
            imposterWord: ""
          }
        }
      : null
  };
}

export async function updateSettings(roomCode: string, formData: FormData) {
  const wordPairs = Array.from({ length: Number(formData.get("pairCount") ?? 0) })
    .map((_, index) => ({
      id: String(formData.get(`pairId-${index}`) ?? ""),
      normalWord: String(formData.get(`normal-${index}`) ?? ""),
      imposterWord: String(formData.get(`imposter-${index}`) ?? ""),
      position: index
    }))
    .filter((pair) => pair.normalWord || pair.imposterWord)
    .map((pair) => wordPairSchema.parse(pair));

  const settings = roomSettingsSchema.parse({
    mode: formData.get("mode"),
    totalPlayers: Number(formData.get("totalPlayers")),
    imposterCount: Number(formData.get("imposterCount")),
    wordPairs
  });

  const room = await prisma.room.findUniqueOrThrow({
    where: { code: normalizeRoomCode(roomCode) },
    include: { wordPairs: true }
  });

  await prisma.$transaction([
    prisma.wordPair.deleteMany({ where: { roomId: room.id } }),
    prisma.room.update({
      where: { id: room.id },
      data: {
        mode: settings.mode,
        totalPlayers: settings.totalPlayers,
        imposterCount: settings.imposterCount,
        wordPairs: {
          create: settings.wordPairs.map((pair) => ({
            normalWord: pair.normalWord,
            imposterWord: pair.imposterWord,
            position: pair.position
          }))
        }
      }
    })
  ]);

  emitRoomUpdate(room.code);
  redirect(`/room/${room.code}`);
}

export async function startRound(roomCode: string) {
  const room = await prisma.room.findUniqueOrThrow({
    where: { code: normalizeRoomCode(roomCode) },
    include: {
      players: { where: { status: "CONNECTED" }, orderBy: { joinedAt: "asc" } },
      wordPairs: { orderBy: { position: "asc" } },
      rounds: { orderBy: { number: "desc" }, take: 1 }
    }
  });

  const settings = roomSettingsSchema.parse({
    mode: room.mode,
    totalPlayers: room.totalPlayers,
    imposterCount: room.imposterCount,
    wordPairs: room.wordPairs
  });

  const participatingPlayers = room.players.filter((p) => !p.isHost);
  if (participatingPlayers.length < 3) {
    throw new Error("At least three connected players are needed.");
  }

  const seed = createShuffleSeed();
  const seedHash = hashSeed(seed);
  const nextNumber = (room.rounds[0]?.number ?? 0) + 1;
  const wordPair = room.wordPairs[(nextNumber - 1) % room.wordPairs.length];
  const assignments = assignWords({
    players: participatingPlayers as Player[],
    imposterCount: settings.imposterCount,
    wordPair: wordPair as WordPair
  });

  const round = await prisma.round.create({
    data: {
      roomId: room.id,
      number: nextNumber,
      wordPairId: wordPair.id,
      seedHash,
      assignments: {
        create: assignments.map((assignment) => ({
          playerId: assignment.playerId,
          isImposter: assignment.isImposter,
          word: assignment.word
        }))
      }
    }
  });

  await prisma.room.update({
    where: { id: room.id },
    data: {
      phase: "REVEAL",
      currentRoundId: round.id,
      shuffleSeedHash: seedHash
    }
  });

  emitRoomUpdate(room.code);
  redirect(`/game/${room.code}`);
}

export async function advancePhase(roomCode: string) {
  const room = await prisma.room.findUniqueOrThrow({ where: { code: normalizeRoomCode(roomCode) } });
  const nextPhase =
    room.mode === "OFFLINE"
      ? room.phase === "REVEAL"
        ? "OFFLINE_DISCUSSION"
        : "RESULTS"
      : room.phase === "REVEAL"
        ? "CLUE_SUBMISSION"
        : room.phase === "CLUE_SUBMISSION"
          ? "CLUE_REVIEW"
          : room.phase === "CLUE_REVIEW"
            ? "VOTING"
            : "RESULTS";

  await prisma.room.update({ where: { id: room.id }, data: { phase: nextPhase } });
  emitRoomUpdate(room.code);
  redirect(`/game/${room.code}`);
}

export async function submitClue(roomCode: string, playerId: string, clueValue: string) {
  const clue = clueSchema.parse(clueValue);
  const room = await prisma.room.findUniqueOrThrow({
    where: { code: normalizeRoomCode(roomCode) },
    include: { currentRound: true }
  });

  if (!room.currentRoundId) {
    throw new Error("No active round is ready for clues.");
  }

  await prisma.clue.upsert({
    where: {
      roundId_playerId: {
        roundId: room.currentRoundId,
        playerId
      }
    },
    update: { value: clue },
    create: {
      roundId: room.currentRoundId,
      playerId,
      value: clue
    }
  });

  const clueCount = await prisma.clue.count({ where: { roundId: room.currentRoundId } });
  const participatingPlayerCount = await prisma.player.count({
    where: { roomId: room.id, status: "CONNECTED", isHost: false }
  });

  if (clueCount >= participatingPlayerCount) {
    await prisma.room.update({ where: { id: room.id }, data: { phase: "CLUE_REVIEW" } });
  }

  emitRoomUpdate(room.code);
  redirect(`/game/${room.code}?player=${playerId}`);
}

export async function submitVote(roomCode: string, voterId: string, targetPlayerId?: string) {
  const room = await prisma.room.findUniqueOrThrow({
    where: { code: normalizeRoomCode(roomCode) }
  });

  if (!room.currentRoundId) {
    throw new Error("No active round is ready for voting.");
  }

  await prisma.vote.upsert({
    where: {
      roundId_voterId: {
        roundId: room.currentRoundId,
        voterId
      }
    },
    update: {
      kind: targetPlayerId ? "PLAYER" : "SKIP",
      targetPlayerId: targetPlayerId ?? null
    },
    create: {
      roundId: room.currentRoundId,
      voterId,
      kind: targetPlayerId ? "PLAYER" : "SKIP",
      targetPlayerId: targetPlayerId ?? null
    }
  });

  const voteCount = await prisma.vote.count({ where: { roundId: room.currentRoundId } });
  const participatingPlayerCount = await prisma.player.count({
    where: { roomId: room.id, status: "CONNECTED", isHost: false }
  });

  if (voteCount >= participatingPlayerCount) {
    await prisma.room.update({ where: { id: room.id }, data: { phase: "RESULTS" } });
  }

  emitRoomUpdate(room.code);
  redirect(`/game/${room.code}?player=${voterId}`);
}

export async function endGame(roomCode: string) {
  const room = await prisma.room.update({
    where: { code: normalizeRoomCode(roomCode) },
    data: { phase: "ENDED" }
  });

  emitRoomUpdate(room.code);
  redirect("/");
}

export async function removePlayer(roomCode: string, playerId: string) {
  const code = normalizeRoomCode(roomCode);
  const room = await prisma.room.findUniqueOrThrow({
    where: { code },
    include: { players: true }
  });

  if (room.hostPlayerId === playerId) {
    throw new Error("The host cannot remove themselves.");
  }

  await prisma.player.delete({
    where: { id: playerId }
  });

  emitRoomUpdate(room.code);
}

export async function exitGame(roomCode: string) {
  const code = normalizeRoomCode(roomCode);
  const room = await prisma.room.findUniqueOrThrow({
    where: { code }
  });

  await prisma.$transaction([
    prisma.room.update({
      where: { id: room.id },
      data: {
        currentRoundId: null,
        phase: "LOBBY"
      }
    }),
    prisma.round.deleteMany({
      where: { roomId: room.id }
    })
  ]);

  emitRoomUpdate(room.code, "ended_by_host");
}
