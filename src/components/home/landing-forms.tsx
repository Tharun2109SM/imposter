"use client";

import { HelpCircle, MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { createRoomAction, joinRoomAction } from "@/server/actions/room-actions";
import { formatRoomCode } from "@/lib/game/room-code";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function LandingForms() {
  const [roomCode, setRoomCode] = useState("");
  const searchParams = useSearchParams();
  const message = searchParams?.get("message");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <h2 className="display-font text-2xl text-[var(--text-main)]">Imposter</h2>
        <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-white/60">
          <HelpCircle size={16} />
          How to play
        </button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-9 py-14 text-center">
        {message === "removed" && (
          <div className="w-full max-w-md rounded-2xl bg-[var(--clay-light)] border border-[var(--clay-solid)]/20 px-5 py-3 text-center text-sm font-medium text-[var(--clay-solid)] animate-in fade-in slide-in-from-top-2 duration-300">
            You were removed by the host.
          </div>
        )}
        <div>
          <h1 className="display-font text-[40px] leading-none text-[var(--text-main)] sm:text-6xl">
            A Quiet Game of Words.
          </h1>
          <p className="mt-4 text-lg italic text-[var(--text-muted)]">
            Find the shadow hiding in plain sight.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          className="grid w-full max-w-[800px] overflow-hidden rounded-3xl border border-[var(--border-cozy)] bg-white text-left shadow-[var(--shadow-soft)] md:grid-cols-2"
        >
          <form action={createRoomAction} className="flex min-h-[310px] flex-col justify-between p-7 sm:p-12">
            <div>
              <p className="mb-8 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                Create a Room
              </p>
              <Label htmlFor="hostName">Your Nickname</Label>
              <Input id="hostName" name="hostName" placeholder="e.g. Marcus" required />
            </div>
            <Button type="submit" className="mt-8 w-full">
              Create Room
            </Button>
          </form>

          <form
            action={joinRoomAction}
            className="flex min-h-[310px] flex-col justify-between border-t border-[var(--border-cozy)] p-7 sm:p-12 md:border-l md:border-t-0"
          >
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                Join a Room
              </p>
              <div>
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  name="roomCode"
                  placeholder="W-A-R-M"
                  maxLength={7}
                  value={roomCode}
                  onChange={(event) => setRoomCode(formatRoomCode(event.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="playerName">Your Nickname</Label>
                <Input id="playerName" name="playerName" placeholder="e.g. Clara" required />
              </div>
            </div>
            <Button type="submit" variant="outline" className="group mt-8 w-full">
              Join Room
              <MoveRight className="ml-2 transition group-hover:translate-x-1" size={16} />
            </Button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
