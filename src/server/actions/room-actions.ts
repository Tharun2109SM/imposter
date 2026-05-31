"use server";

import { cookies } from "next/headers";
import {
  advancePhase,
  createRoom,
  deleteRoom,
  endGame,
  exitGame,
  joinRoom,
  removePlayer,
  startRound,
  submitClue,
  submitVote,
  updateSettings,
  getHostDeleteCookieName
} from "@/server/room-service";

export async function createRoomAction(formData: FormData) {
  await createRoom(String(formData.get("hostName") ?? ""));
}

export async function joinRoomAction(formData: FormData) {
  await joinRoom(String(formData.get("roomCode") ?? ""), String(formData.get("playerName") ?? ""));
}

export async function updateSettingsAction(roomCode: string, formData: FormData) {
  await updateSettings(roomCode, formData);
}

export async function startRoundAction(roomCode: string) {
  await startRound(roomCode);
}

export async function advancePhaseAction(roomCode: string) {
  await advancePhase(roomCode);
}

export async function endGameAction(roomCode: string) {
  await endGame(roomCode);
}

export async function submitClueAction(roomCode: string, playerId: string, formData: FormData) {
  await submitClue(roomCode, playerId, String(formData.get("clue") ?? ""));
}

export async function submitVoteAction(roomCode: string, voterId: string, targetPlayerId?: string) {
  await submitVote(roomCode, voterId, targetPlayerId);
}

export async function removePlayerAction(roomCode: string, playerId: string) {
  await removePlayer(roomCode, playerId);
}

export async function exitGameAction(roomCode: string) {
  await exitGame(roomCode);
}

export async function deleteRoomAction(roomCode: string, requesterPlayerId: string) {
  const cookieStore = await cookies();
  const hostDeleteToken = cookieStore.get(getHostDeleteCookieName(roomCode))?.value;

  return deleteRoom(roomCode, requesterPlayerId, hostDeleteToken);
}
