"use client";

import { useState, useTransition } from "react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { removePlayerAction } from "@/server/actions/room-actions";
import type { Player } from "@/lib/game/types";

export function PlayerRoster({
  players,
  isHostViewer = false,
  roomCode
}: {
  players: Player[];
  isHostViewer?: boolean;
  roomCode?: string;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isPending, startTransition] = useTransition();

  const participantsCount = players.filter((p) => !p.isHost).length;

  return (
    <>
      <Panel className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
            Participants ({participantsCount})
          </p>
        </div>

        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-xl border border-[var(--border-cozy)] bg-[#fffdf9] px-4 py-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center">
                <span className="font-medium">{player.name}</span>
                {isHostViewer && !player.isHost && (
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer(player)}
                    className="ml-3 rounded-lg bg-[var(--clay-light)] px-2 py-0.5 text-xs font-bold text-[var(--clay-solid)] hover:bg-[var(--clay-solid)] hover:text-white transition cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  player.isHost
                    ? "bg-[var(--amber-light)] text-[var(--amber-solid)]"
                    : "bg-[var(--sage-light)] text-[var(--sage-solid)]"
                }`}
              >
                {player.isHost ? "Host" : "Ready"}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2824]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Panel className="w-full max-w-sm p-6 text-center space-y-6 shadow-2xl border border-[var(--border-cozy)] bg-[#faf6f0]">
            <div>
              <h3 className="display-font text-2xl text-[var(--clay-solid)]">Remove Player</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Are you sure you want to remove <strong>{selectedPlayer.name}</strong> from the room?
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPlayer(null)}
                disabled={isPending}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                onClick={() => {
                  if (!roomCode) return;
                  startTransition(async () => {
                     try {
                       await removePlayerAction(roomCode, selectedPlayer.id);
                       window.dispatchEvent(new CustomEvent("room:trigger-refresh"));
                       setSelectedPlayer(null);
                     } catch (err) {
                       console.error(err);
                       alert("Failed to remove player. Please try again.");
                     }
                  });
                }}
                className="flex-1 h-11 bg-[var(--clay-solid)] hover:bg-[var(--clay-solid)]/90 text-white font-semibold"
              >
                {isPending ? "Removing..." : "Remove"}
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
