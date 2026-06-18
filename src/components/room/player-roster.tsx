"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
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
  const connectedCount = players.filter((p) => p.status === "CONNECTED" && !p.isHost).length;

  return (
    <>
      <div className="equipment-panel rounded-[1.7rem] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#FF9B42]">
            Viewer Registry ({participantsCount})
          </p>
          <span className="rounded-full border-2 border-[#33211D] bg-[#31D7C6] px-3 py-1 text-xs font-black text-[#161218] shadow-[2px_2px_0_#33211D] dark:border-[#0B080D] dark:shadow-[2px_2px_0_#0B080D]">
            {connectedCount === 0 ? "No Signal" : `${connectedCount} live`}
          </span>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: index * 0.025 }}
                className="group relative overflow-hidden rounded-[1.15rem] border-2 border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F2D1A8)] p-3 shadow-[4px_4px_0_rgba(51,33,29,0.24)] transition duration-300 hover:-translate-y-1 hover:rotate-[0.35deg] hover:shadow-[6px_6px_0_rgba(51,33,29,0.3)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:shadow-[4px_4px_0_#0B080D] dark:hover:shadow-[6px_6px_0_#0B080D]"
              >
                <div className="pointer-events-none absolute right-3 top-3 h-2 w-12 rounded-full bg-[repeating-linear-gradient(90deg,#233A5A_0_0.35rem,transparent_0.35rem_0.58rem)] opacity-18 dark:bg-[repeating-linear-gradient(90deg,#31D7C6_0_0.35rem,transparent_0.35rem_0.58rem)] dark:opacity-28" />
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#33211D] text-sm font-black shadow-[3px_3px_0_rgba(51,33,29,0.26)] dark:border-[#0B080D] dark:shadow-[3px_3px_0_#0B080D] ${
                      player.isHost
                        ? "bg-[#F6B73C] text-[#33211D]"
                        : "bg-[#F67A3C] text-[#FFF3DC] dark:bg-[#31D7C6] dark:text-[#161218]"
                    }`}
                  >
                    {player.name.charAt(0).toUpperCase()}
                    <span
                      className={`absolute -right-0.5 -top-0.5 size-3 rounded-full border border-[#33211D] dark:border-[#0B080D] ${
                        player.status === "CONNECTED" ? "bg-[#31D7C6]" : "bg-[#B94F37]"
                      }`}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-black text-[#33211D] dark:text-[#F7EAD8]">{player.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.08em] ${
                          player.isHost
                            ? "border-[#33211D] bg-[#F6B73C] text-[#33211D] dark:border-[#0B080D]"
                            : "border-[#33211D] bg-[#FFF6E8] text-[#775348] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#F7EAD8]/70"
                        }`}
                      >
                        {player.isHost ? "Host" : "Ready"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[0.68rem] font-black uppercase tracking-[0.13em] text-[#775348] dark:text-[#F7EAD8]/54">
                      {player.status === "CONNECTED" ? "Signal connected" : "Signal lost"}
                    </p>
                  </div>
                  {isHostViewer && !player.isHost && (
                    <button
                      type="button"
                      onClick={() => setSelectedPlayer(player)}
                      className="rounded-full border-2 border-[#33211D] bg-[#D9829B] px-3 py-1 text-xs font-black text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.24)] transition hover:bg-[#B94F37] hover:text-[#FFF3DC] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[2px_2px_0_#0B080D]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {players.length === 1 ? (
            <div className="rounded-[1.15rem] border-2 border-dashed border-[#33211D] bg-[#FFF6E8]/72 px-4 py-5 text-center text-sm font-black text-[#775348] dark:border-[#0B080D] dark:bg-[#161218] dark:text-[#F7EAD8]/64">
              Waiting for viewers. Share the channel code.
            </div>
          ) : null}
        </div>
      </div>

      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2824]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="equipment-panel soft-enter w-full max-w-sm space-y-6 rounded-[1.7rem] p-6 text-center">
            <div>
              <h3 className="display-font text-2xl text-[#B94F37] dark:text-[#FF9B42]">Drop Signal</h3>
              <p className="mt-2 text-sm font-bold text-[#775348] dark:text-[#F7EAD8]/70">
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
          </div>
        </div>
      )}
    </>
  );
}
