"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { exitGameAction } from "@/server/actions/room-actions";

export function ExitToLobbyButton({
  isHost,
  roomCode,
  playerId,
  currentRoundNumber
}: {
  isHost: boolean;
  roomCode: string;
  playerId: string;
  currentRoundNumber: number;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePlayerExit = () => {
    router.push(`/room/${roomCode}?player=${playerId}&exited=true&round=${currentRoundNumber}&message=exited`);
  };

  const handleHostExit = () => {
    startTransition(async () => {
      try {
        await exitGameAction(roomCode);
        window.dispatchEvent(
          new CustomEvent("room:trigger-refresh", {
            detail: { message: "ended_by_host" }
          })
        );
        router.push(`/room/${roomCode}?player=${playerId}&message=ended_by_host`);
      } catch (err) {
        console.error(err);
        alert("Failed to exit game. Please try again.");
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          if (isHost) {
            setShowConfirm(true);
          } else {
            handlePlayerExit();
          }
        }}
        className="text-xs font-semibold px-4 py-2 h-9 border-[var(--border-cozy)] hover:bg-[var(--clay-light)] hover:text-[var(--clay-solid)] transition cursor-pointer"
      >
        Exit to Lobby
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2824]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Panel className="w-full max-w-sm p-6 text-center space-y-6 shadow-2xl border border-[var(--border-cozy)] bg-[#faf6f0]">
            <div>
              <h3 className="display-font text-2xl text-[var(--clay-solid)]">End Current Game?</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Are you sure you want to end the game session? This will return all players back to the lobby.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                onClick={handleHostExit}
                className="flex-1 h-11 bg-[var(--clay-solid)] hover:bg-[var(--clay-solid)]/90 text-white font-semibold"
              >
                {isPending ? "Ending..." : "End Game"}
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}

export function CompleteGameButton({
  roomCode,
  playerId
}: {
  roomCode: string;
  playerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await exitGameAction(roomCode);
        window.dispatchEvent(
          new CustomEvent("room:trigger-refresh", {
            detail: { message: "completed" }
          })
        );
        router.push(`/room/${roomCode}?player=${playerId}&message=completed`);
      } catch (err) {
        console.error(err);
        alert("Failed to complete game. Please try again.");
      }
    });
  };

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={handleComplete}
      className="w-full h-12 text-base font-semibold bg-[var(--sage-solid)] hover:bg-[var(--sage-hover)] text-white shadow-[var(--shadow-soft)] cursor-pointer"
    >
      {isPending ? "Returning..." : "Complete Game & Return to Lobby"}
    </Button>
  );
}
