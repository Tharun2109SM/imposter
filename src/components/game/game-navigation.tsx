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
        className="h-10 rounded-xl border-2 border-[#33211D] bg-[#FFF6E8] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#233A5A] shadow-[3px_3px_0_#33211D] transition hover:-translate-y-0.5 hover:bg-[#FFE2A2] hover:text-[#33211D] hover:shadow-[5px_5px_0_#33211D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[3px_3px_0_#0B080D] dark:hover:bg-[#4E2A84] dark:hover:text-[#F7EAD8] dark:hover:shadow-[5px_5px_0_#0B080D] dark:active:shadow-[2px_2px_0_#0B080D]"
      >
        Exit
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#33211D]/48 p-4 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-[#0B080D]/72">
          <Panel className="w-full max-w-md space-y-6 rounded-[1.75rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F2D1A8)] p-6 text-center shadow-[8px_9px_0_#233A5A,0_36px_90px_-52px_rgba(51,33,29,0.82)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:shadow-[8px_9px_0_#0B080D,12px_13px_0_rgba(255,79,163,0.18)]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#31D7C6]">Arcade Warning</p>
              <h3 className="display-font mt-2 text-4xl leading-none text-[#33211D] dark:text-[#F7EAD8]">End Current Game?</h3>
              <p className="mt-4 text-sm font-bold leading-6 text-[#775348] dark:text-[#F7EAD8]/74">
                Are you sure you want to end the game session? This will return all players back to the lobby.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="h-12 flex-1 rounded-xl border-2 border-[#33211D] bg-[#FFF6E8] text-xs font-black uppercase tracking-[0.1em] text-[#233A5A] shadow-[4px_4px_0_#33211D] hover:-translate-y-0.5 hover:bg-[#FFE2A2] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#F7EAD8] dark:shadow-[4px_4px_0_#0B080D] dark:hover:bg-[#4E2A84]"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                onClick={handleHostExit}
                className="broadcast-danger h-12 flex-1 rounded-xl text-xs font-black uppercase tracking-[0.1em]"
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
      className="broadcast-button h-14 w-full rounded-2xl text-sm font-black uppercase tracking-[0.12em]"
    >
      {isPending ? "Returning..." : "Return to Lobby"}
    </Button>
  );
}
