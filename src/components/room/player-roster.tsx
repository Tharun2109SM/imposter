"use client";

import { AnimatePresence, motion } from "framer-motion";
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
      <Panel className="glass-card p-6 sm:p-7 hover:shadow-[var(--shadow-hover)]">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--clay-solid)]">
            Friends in the Room ({participantsCount})
          </p>
          <span className="rounded-full bg-[var(--navy-solid)] px-3 py-1 text-xs font-black text-white">
            {participantsCount === 0 ? "Waiting" : `${participantsCount} ready`}
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: index * 0.025 }}
                className="group flex items-center justify-between rounded-[1.4rem] border border-white/60 bg-white/62 px-4 py-3.5 shadow-[var(--shadow-soft)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:rotate-[0.4deg] hover:bg-white/82 hover:shadow-[var(--shadow-hover)]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      player.isHost
                        ? "bg-[var(--amber-solid)] text-[var(--navy-solid)]"
                        : "bg-[var(--coral-solid)] text-white"
                    }`}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate font-semibold text-[var(--text-main)]">{player.name}</span>
                {isHostViewer && !player.isHost && (
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer(player)}
                    className="rounded-full bg-[var(--clay-light)] px-3 py-1 text-xs font-black text-[var(--clay-solid)] transition hover:bg-[var(--clay-solid)] hover:text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  player.isHost
                    ? "border-[var(--amber-solid)]/30 bg-[var(--amber-light)] text-[var(--navy-solid)] shadow-[0_1px_14px_rgba(245,166,35,0.24)]"
                    : "border-[var(--coral-solid)]/20 bg-[var(--clay-light)] text-[var(--clay-solid)]"
                }`}
              >
                {player.isHost ? "Host" : "Ready"}
              </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {players.length === 1 ? (
            <div className="rounded-[1.4rem] border border-dashed border-white/60 bg-white/35 px-4 py-5 text-center text-sm font-bold text-[var(--text-muted)] backdrop-blur">
              Waiting for the crew. Share the code.
            </div>
          ) : null}
        </div>
      </Panel>

      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2824]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Panel className="soft-enter w-full max-w-sm space-y-6 border border-[var(--border-cozy)] bg-[#faf6f0] p-6 text-center shadow-2xl">
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
