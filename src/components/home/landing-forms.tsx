"use client";

import { Crown, MoveRight, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { createRoomAction, joinRoomAction } from "@/server/actions/room-actions";
import { formatRoomCode } from "@/lib/game/room-code";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { HowToPlayModal } from "@/components/home/how-to-play-modal";

function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className = ""
}: {
  children: React.ReactNode;
  pendingText: string;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending} className={`${className} disabled:opacity-70`}>
      {pending ? pendingText : children}
    </Button>
  );
}

const floatingTiles = [
  { text: "suspicious clue", className: "left-[-1rem] top-[15%] bg-[var(--amber-solid)] text-[var(--navy-solid)] text-sm rotate-[-12deg]" },
  { text: "trust nobody", className: "right-[5%] top-[13%] bg-[var(--pink-light)] text-[var(--navy-solid)] text-base rotate-[8deg]" },
  { text: "no peeking", className: "right-[-2rem] top-[31%] bg-white/85 text-[var(--clay-solid)] text-sm rotate-[15deg]" },
  { text: "definitely lying", className: "left-[6%] top-[35%] bg-[var(--clay-solid)] text-white text-xs rotate-[7deg]" },
  { text: "wild guess", className: "left-[18%] top-[9%] bg-white/80 text-[var(--navy-solid)] text-xs rotate-[10deg]" },
  { text: "vote now", className: "right-[18%] top-[50%] bg-[var(--amber-light)] text-[var(--navy-solid)] text-sm rotate-[-9deg]" },
  { text: "secret word", className: "left-[-2rem] bottom-[19%] bg-[var(--pink-light)] text-[var(--navy-solid)] text-base rotate-[11deg]" },
  { text: "sounds fake", className: "right-[2%] bottom-[14%] bg-[var(--navy-solid)] text-white text-sm rotate-[-10deg]" },
  { text: "imposter?", className: "left-[32%] top-[22%] bg-[#8d5cf6] text-white text-sm rotate-[-5deg]" },
  { text: "caught you", className: "right-[31%] bottom-[7%] bg-[var(--coral-solid)] text-white text-xs rotate-[13deg]" },
  { text: "too confident", className: "left-[44%] top-[6%] bg-white/70 text-[var(--navy-solid)] text-xs rotate-[-14deg]" },
  { text: "hmm...", className: "left-[10%] bottom-[4%] bg-[var(--amber-solid)] text-[var(--navy-solid)] text-xs rotate-[5deg]" },
  { text: "nice try", className: "right-[42%] top-[38%] bg-white/65 text-[var(--clay-solid)] text-xs rotate-[9deg]" },
  { text: "who said that?", className: "right-[8%] bottom-[31%] bg-[var(--pink-light)] text-[var(--navy-solid)] text-xs rotate-[6deg]" },
  { text: "coffee?", className: "left-[28%] bottom-[25%] bg-[var(--amber-light)] text-[var(--navy-solid)] text-sm rotate-[-8deg]" },
  { text: "fake laugh", className: "right-[24%] top-[21%] bg-[var(--clay-solid)] text-white text-xs rotate-[12deg]" },
  { text: "say less", className: "left-[4%] top-[58%] bg-white/75 text-[var(--navy-solid)] text-xs rotate-[-6deg]" },
  { text: "sus", className: "right-[13%] top-[72%] bg-[#8d5cf6] text-white text-base rotate-[10deg]" },
  { text: "one word", className: "left-[51%] bottom-[18%] bg-[var(--amber-solid)] text-[var(--navy-solid)] text-xs rotate-[-11deg]" },
  { text: "prove it", className: "left-[58%] top-[68%] bg-white/75 text-[var(--clay-solid)] text-sm rotate-[7deg]" },
  { text: "red flag", className: "left-[74%] top-[5%] bg-[var(--coral-solid)] text-white text-xs rotate-[-8deg]" }
];

export function LandingForms() {
  const [roomCode, setRoomCode] = useState("");
  const searchParams = useSearchParams();
  const message = searchParams?.get("message");

  return (
    <main className="ambient-bg party-shell min-h-screen overflow-hidden px-4 py-5 text-[var(--text-main)] sm:px-8">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {floatingTiles.map((tile, index) => (
          <motion.span
            key={tile.text}
            className={`floating-word-tile absolute rounded-full px-4 py-2 font-black shadow-[var(--shadow-soft)] backdrop-blur-md ${
              index > 8 ? "hidden sm:block" : "block"
            } ${tile.className} ${
              index % 3 === 0 ? "opacity-95" : index % 3 === 1 ? "opacity-80" : "opacity-65"
            } ${index % 4 === 0 ? "z-0" : "z-10"}`}
            style={{ animationDelay: `${index * -0.35}s` }}
          >
            <span className="block">{tile.text}</span>
          </motion.span>
        ))}
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between">
        <div>
          <p className="display-font text-xl leading-none text-white/85 drop-shadow-sm sm:text-2xl">
            Created by Tharun.S.M
          </p>
          <h1 className="display-font text-4xl leading-none text-white drop-shadow-sm">Imposter.</h1>
        </div>
        <HowToPlayModal />
      </header>

      <section className="relative z-20 mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl flex-col items-center justify-start gap-6 py-8 md:justify-center">
        {message === "removed" ? (
          <div className="glass-panel w-full max-w-md rounded-2xl px-5 py-3 text-center text-sm font-black text-white">
            You were removed by the host.
          </div>
        ) : null}
        {message === "room_closed" ? (
          <div className="glass-panel w-full max-w-md rounded-2xl px-5 py-3 text-center text-sm font-black text-white">
            Room has been closed by the host.
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative w-full"
        >
          <div className="absolute left-2 top-8 hidden rotate-[-10deg] rounded-[2rem] bg-[var(--amber-solid)] px-6 py-4 text-sm font-black text-[var(--navy-solid)] shadow-[var(--shadow-lifted)] md:block">
            suspicious vibes
          </div>
          <div className="absolute bottom-4 right-2 hidden rotate-[8deg] rounded-[2rem] bg-[var(--pink-light)] px-6 py-4 text-sm font-black text-[var(--navy-solid)] shadow-[var(--shadow-lifted)] md:block">
            no peeking
          </div>

          <div className="glass-panel relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] p-5 shadow-[var(--shadow-lifted)] sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[var(--amber-solid)]/35 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-[#8d5cf6]/25 blur-2xl" />

            <div className="relative text-center">
              <h2 className="display-font text-[72px] leading-[0.78] text-white drop-shadow-md sm:text-9xl lg:text-[150px]">
                Imposter.
              </h2>
              <p className="mt-5 text-base font-black uppercase tracking-[0.16em] text-[var(--amber-light)] sm:text-lg">
                Find the friend who is faking it.
              </p>

              <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
                {["Secret words", "Wild clues", "Loud votes"].map((item) => (
                  <div key={item} className="rounded-3xl bg-white/18 px-4 py-3 text-sm font-black text-white shadow-[var(--shadow-soft)] backdrop-blur-md">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 130, damping: 18 }}
          className="glass-panel w-full max-w-4xl overflow-hidden rounded-[2.25rem] shadow-[var(--shadow-lifted)]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/20 bg-[var(--navy-solid)]/72 px-6 py-5 text-white sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--amber-solid)] text-[var(--navy-solid)] shadow-[var(--shadow-soft)]">
                <UsersRound size={22} />
              </span>
              <div>
                <p className="display-font text-3xl leading-none">Open the room</p>
                <p className="mt-1 text-sm font-bold text-white/70">Get everyone in. Start accusing.</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--navy-solid)] sm:inline-flex">
              <Crown size={15} />
              Tharun.S.M
            </div>
          </div>

          <div className="grid md:grid-cols-2">
            <form action={createRoomAction} className="flex min-h-[290px] flex-col justify-between bg-[rgba(255,240,186,0.72)] p-7 sm:p-9">
              <div>
                <p className="mb-8 inline-flex rounded-full bg-[var(--navy-solid)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                  Host
                </p>
                <Label htmlFor="hostName">Your Nickname</Label>
                <Input id="hostName" name="hostName" placeholder="e.g. Marcus" minLength={2} maxLength={24} required />
              </div>
              <SubmitButton pendingText="Opening room..." className="mt-8 min-h-14 w-full text-base">
                Start the Chaos
              </SubmitButton>
            </form>

            <form
              action={joinRoomAction}
              className="flex min-h-[290px] flex-col justify-between border-t border-white/25 bg-[rgba(255,215,229,0.7)] p-7 sm:p-9 md:border-l md:border-t-0"
            >
              <div className="space-y-5">
                <p className="inline-flex rounded-full bg-[var(--navy-solid)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                  Join
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
                  <Input id="playerName" name="playerName" placeholder="e.g. Clara" minLength={2} maxLength={24} required />
                </div>
              </div>
              <SubmitButton pendingText="Joining..." variant="outline" className="group mt-8 min-h-14 w-full text-base">
                Jump In
                <MoveRight className="ml-2 transition group-hover:translate-x-1" size={16} />
              </SubmitButton>
            </form>
          </div>
        </motion.div>
      </section>

      <footer className="pb-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white/65">
        Created by Tharun.S.M
      </footer>
    </main>
  );
}
