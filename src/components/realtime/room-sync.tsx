"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { io, type Socket } from "socket.io-client";

type RoomState = {
  phase: string;
  updatedAt: string;
  currentRound?: {
    number: number;
  } | null;
};

function getPollingInterval(phase?: string) {
  switch (phase) {
    case "LOBBY":
      return 5_000;
    case "REVEAL":
    case "CLUE_SUBMISSION":
    case "CLUE_REVIEW":
    case "VOTING":
      return 500;
    case "OFFLINE_DISCUSSION":
    case "RESULTS":
      return 1_000;
    default:
      return 1_000;
  }
}

function getStateFingerprint(room: RoomState) {
  return `${room.phase}:${room.currentRound?.number ?? "none"}:${room.updatedAt}`;
}

export function RoomSync({
  roomCode,
  playerId,
  broadcastOnMount = false
}: {
  roomCode: string;
  playerId: string;
  broadcastOnMount?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const exited = searchParams?.get("exited") === "true";
  const exitedRoundStr = searchParams?.get("round");
  const exitedRound = exitedRoundStr ? parseInt(exitedRoundStr, 10) : null;

  useEffect(() => {
    let isMounted = true;
    let isNavigating = false;
    let checkInFlight = false;
    let socket: Socket | null = null;
    let pollTimer: number | null = null;
    let requestController: AbortController | null = null;
    let currentPhase: string | undefined;
    let lastFingerprint: string | null = null;
    let pendingMessage: string | undefined;

    const clearPollTimer = () => {
      if (pollTimer !== null) {
        window.clearTimeout(pollTimer);
        pollTimer = null;
      }
    };

    const stopSync = () => {
      isNavigating = true;
      clearPollTimer();
      requestController?.abort();
      socket?.emit("room:leave", roomCode);
      socket?.disconnect();
    };

    const schedulePoll = () => {
      if (!isMounted || isNavigating) return;
      clearPollTimer();
      pollTimer = window.setTimeout(() => {
        void checkRoomState();
      }, getPollingInterval(currentPhase));
    };

    const applyRoomState = (room: RoomState, message?: string) => {
      currentPhase = room.phase;
      const nextFingerprint = getStateFingerprint(room);
      const stateChanged = lastFingerprint !== null && lastFingerprint !== nextFingerprint;
      lastFingerprint = nextFingerprint;

      if (pathname?.startsWith("/game/") && room.phase === "LOBBY") {
        const playerQuery = `?player=${encodeURIComponent(playerId)}`;
        const msgQuery = message ? `&message=${encodeURIComponent(message)}` : "";
        stopSync();
        router.push(`/room/${roomCode}${playerQuery}${msgQuery}`);
        return;
      }

      if (pathname?.startsWith("/room/") && room.phase !== "LOBBY" && room.phase !== "ENDED") {
        const isNewRound =
          exitedRound !== null &&
          room.currentRound?.number !== undefined &&
          room.currentRound.number !== exitedRound;
        if (!exited || isNewRound) {
          stopSync();
          router.push(`/game/${roomCode}?player=${encodeURIComponent(playerId)}`);
          return;
        }
      }

      if (stateChanged) {
        router.refresh();
      }

      schedulePoll();
    };

    async function checkRoomState(message?: string) {
      if (message) pendingMessage = message;
      if (!isMounted || isNavigating) return;
      if (checkInFlight) {
        schedulePoll();
        return;
      }

      checkInFlight = true;
      requestController = new AbortController();

      try {
        const response = await fetch(`/api/rooms/${roomCode}/state`, {
          cache: "no-store",
          signal: requestController.signal
        });

        if (!isMounted || isNavigating) return;
        if (!response.ok) {
          stopSync();
          router.push("/?message=room_closed");
          return;
        }

        const room = (await response.json()) as RoomState;
        const messageForState = pendingMessage;
        pendingMessage = undefined;
        applyRoomState(room, messageForState);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        schedulePoll();
      } finally {
        checkInFlight = false;
        requestController = null;
      }
    }

    const handleTriggerRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      if (socket) {
        socket.emit("room:refresh", roomCode, customEvent.detail?.message);
      }
      void checkRoomState(customEvent.detail?.message);
    };

    window.addEventListener("room:trigger-refresh", handleTriggerRefresh);
    void checkRoomState();

    fetch("/api/socket")
      .then(() => {
        if (!isMounted || isNavigating) return;

        socket = io({
          path: "/api/socket/io",
          addTrailingSlash: false
        });

        socket.emit("room:join", roomCode);
        if (broadcastOnMount) {
          socket.emit("room:refresh", roomCode);
        }

        socket.on("room:updated", (message?: string) => {
          void checkRoomState(message);
        });

        socket.on("room:deleted", () => {
          stopSync();
          router.push("/?message=room_closed");
        });
      })
      .catch(() => {
        // Polling remains authoritative when Socket.IO is unavailable.
      });

    return () => {
      isMounted = false;
      clearPollTimer();
      requestController?.abort();
      socket?.disconnect();
      window.removeEventListener("room:trigger-refresh", handleTriggerRefresh);
    };
  }, [broadcastOnMount, pathname, playerId, roomCode, router, exited, exitedRound]);

  return null;
}
