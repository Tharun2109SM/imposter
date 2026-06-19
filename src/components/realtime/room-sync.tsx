"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { io, type Socket } from "socket.io-client";

type RoomState = {
  phase: string;
  currentRound?: {
    number: number;
  } | null;
};

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
    let socket: Socket | null = null;

    const handleTriggerRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      if (socket) {
        socket.emit("room:refresh", roomCode, customEvent.detail?.message);
      }
    };

    fetch("/api/socket").then(() => {
      if (!isMounted) return;

      socket = io({
        path: "/api/socket/io",
        addTrailingSlash: false
      });

      socket.emit("room:join", roomCode);
      if (broadcastOnMount) {
        socket.emit("room:refresh", roomCode);
      }

      socket.on("room:updated", async (message?: string) => {
        const response = await fetch(`/api/rooms/${roomCode}/state`, {
          cache: "no-store"
        });

        if (!response.ok) {
          socket?.emit("room:leave", roomCode);
          socket?.disconnect();
          router.push("/?message=room_closed");
          return;
        }

        const room = (await response.json()) as RoomState;

        // If the game has ended, automatically redirect players from /game/ to /room/
        if (pathname?.startsWith("/game/") && room.phase === "LOBBY") {
          const playerQuery = `?player=${encodeURIComponent(playerId)}`;
          const msgQuery = message ? `&message=${encodeURIComponent(message)}` : "";
          router.push(`/room/${roomCode}${playerQuery}${msgQuery}`);
          return;
        }

        // For lobby-to-game redirection
        if (pathname?.startsWith("/room/") && room.phase !== "LOBBY" && room.phase !== "ENDED") {
          // If the player exited the game manually, do not redirect them back
          // UNLESS a new round has started.
          const isNewRound = exitedRound !== null && room.currentRound?.number !== undefined && room.currentRound.number !== exitedRound;
          if (!exited || isNewRound) {
            const playerQuery = `?player=${encodeURIComponent(playerId)}`;
            router.push(`/game/${roomCode}${playerQuery}`);
            return;
          }
        }

        router.refresh();
      });

      socket.on("room:deleted", () => {
        socket?.emit("room:leave", roomCode);
        socket?.disconnect();
        router.push("/?message=room_closed");
      });

      window.addEventListener("room:trigger-refresh", handleTriggerRefresh);
    });

    return () => {
      isMounted = false;
      socket?.disconnect();
      window.removeEventListener("room:trigger-refresh", handleTriggerRefresh);
    };
  }, [broadcastOnMount, pathname, playerId, roomCode, router, exited, exitedRound]);

  return null;
}
