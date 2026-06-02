"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Coffee, EyeOff, HelpCircle, MessageCircle, Search, Vote, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

type TutorialSlide = {
  title: string;
  description: string[];
  example?: string;
  visual: "players" | "word" | "clues" | "suspect" | "vote";
};

const slides: TutorialSlide[] = [
  {
    title: "Welcome to Imposter",
    description: [
      "Everyone receives a secret word.",
      "Most players get the same word.",
      "A few players are secretly imposters."
    ],
    visual: "players"
  },
  {
    title: "Learn Your Word",
    description: ["Each player privately views their word.", "Never show your word to anyone else."],
    visual: "word"
  },
  {
    title: "Give Clever Clues",
    description: [
      "Take turns giving clues related to your word.",
      "Be specific enough to help your team.",
      "Be vague enough to avoid helping imposters."
    ],
    example: "Word = Coffee · Clue = Morning",
    visual: "clues"
  },
  {
    title: "Find the Imposter",
    description: [
      "Listen carefully to every clue.",
      "Imposters do not know the secret word.",
      "Watch for suspicious answers."
    ],
    visual: "suspect"
  },
  {
    title: "Vote and Reveal",
    description: [
      "Vote for the player you think is the imposter.",
      "If the imposters survive, they win.",
      "If they are discovered, everyone else wins."
    ],
    visual: "vote"
  }
] ;

const tips = [
  "Don't make clues too obvious.",
  "Don't stay too vague.",
  "Watch how confident people sound.",
  "Imposters often copy other clues."
];

function TutorialVisual({ type }: { type: TutorialSlide["visual"] }) {
  if (type === "players") {
    return (
      <div className="grid grid-cols-3 gap-3">
        {["A", "B", "?"].map((label, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14, rotate: index === 2 ? 6 : -3 }}
            animate={{ opacity: 1, y: 0, rotate: index === 2 ? 6 : index === 0 ? -5 : 2 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 140, damping: 13 }}
            className={`flex aspect-[3/4] items-center justify-center rounded-[1.4rem] border border-white/35 text-4xl font-black shadow-[var(--shadow-soft)] ${
              index === 2 ? "bg-[var(--navy-solid)] text-[var(--amber-solid)]" : "bg-white/75 text-[var(--navy-solid)]"
            }`}
          >
            {label}
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === "word") {
    return (
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto flex aspect-[4/5] max-h-56 w-44 flex-col items-center justify-center rounded-[1.7rem] border border-white/40 bg-white/78 p-5 text-center shadow-[var(--shadow-lifted)]"
      >
        <EyeOff className="mb-4 text-[var(--clay-solid)]" size={28} />
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">Secret Word</p>
        <p className="display-font mt-3 text-5xl text-[var(--navy-solid)]">???</p>
      </motion.div>
    );
  }

  if (type === "clues") {
    return (
      <div className="space-y-3">
        {["Morning", "Warm", "Cup"].map((clue, index) => (
          <motion.div
            key={clue}
            initial={{ opacity: 0, x: index % 2 ? 18 : -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-black shadow-[var(--shadow-soft)] ${
              index === 1 ? "ml-8 bg-[var(--pink-light)] text-[var(--navy-solid)]" : "mr-8 bg-white/78 text-[var(--navy-solid)]"
            }`}
          >
            <MessageCircle size={17} />
            {clue}
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === "suspect") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {["Mia", "Jay", "Noah", "Lina"].map((name, index) => (
          <motion.div
            key={name}
            animate={index === 2 ? { scale: [1, 1.04, 1], boxShadow: "0 0 30px rgba(229,83,79,0.35)" } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`rounded-[1.3rem] border px-4 py-4 text-center font-black ${
              index === 2
                ? "border-[var(--clay-solid)] bg-[var(--clay-light)] text-[var(--clay-solid)]"
                : "border-white/35 bg-white/72 text-[var(--navy-solid)]"
            }`}
          >
            {index === 2 ? <Search className="mx-auto mb-2" size={18} /> : null}
            {name}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-56 max-w-xs items-center justify-center">
      <motion.div
        animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-4 top-5 rounded-[1.5rem] bg-white/78 px-6 py-5 text-center font-black text-[var(--navy-solid)] shadow-[var(--shadow-soft)]"
      >
        Vote
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="z-10 flex size-24 items-center justify-center rounded-full bg-[var(--amber-solid)] text-[var(--navy-solid)] shadow-[var(--shadow-lifted)]"
      >
        <Vote size={34} />
      </motion.div>
      <motion.div
        animate={{ rotate: [0, 5, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 right-2 rounded-[1.5rem] bg-[var(--navy-solid)] px-6 py-5 text-center font-black text-white shadow-[var(--shadow-soft)]"
      >
        Reveal
      </motion.div>
    </div>
  );
}

export function HowToPlayModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const titleId = useId();
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setStep((current) => Math.min(current + 1, slides.length - 1));
      if (event.key === "ArrowLeft") setStep((current) => Math.max(current - 1, 0));
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
        className="glass-panel pressable inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white"
      >
        <HelpCircle size={16} />
        How to Play
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,18,34,0.55)] p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="glass-panel confetti-dots max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] p-4 text-[var(--text-main)] shadow-[var(--shadow-lifted)] sm:p-6"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 170, damping: 19 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="rounded-[1.6rem] bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--clay-solid)]">
                      Learn in 30 seconds
                    </p>
                    <h2 id={titleId} className="display-font mt-1 text-4xl leading-none text-[var(--navy-solid)]">
                      {slide.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Close how to play"
                    onClick={() => setOpen(false)}
                    className="pressable flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--navy-solid)] text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                  <div className="rounded-[1.6rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,240,186,0.92),rgba(255,215,229,0.88))] p-6 shadow-[var(--shadow-soft)]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={slide.title}
                        initial={{ opacity: 0, x: 22 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -22 }}
                        transition={{ duration: 0.24 }}
                      >
                        <TutorialVisual type={slide.visual} />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={slide.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-3"
                      >
                        {slide.description.map((line) => (
                          <p key={line} className="rounded-2xl bg-white/72 px-4 py-3 text-base font-bold leading-7 text-[var(--text-main)]">
                            {line}
                          </p>
                        ))}
                        {slide.example ? (
                          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--amber-light)] px-4 py-2 text-sm font-black text-[var(--navy-solid)]">
                            <Coffee size={16} />
                            {slide.example}
                          </div>
                        ) : null}
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 flex items-center gap-2" aria-label={`Step ${step + 1} of ${slides.length}`}>
                      {slides.map((item, index) => (
                        <button
                          key={item.title}
                          type="button"
                          aria-label={`Go to step ${index + 1}`}
                          onClick={() => setStep(index)}
                          className={`size-3 rounded-full transition ${
                            step === index ? "scale-125 bg-[var(--clay-solid)]" : "bg-[var(--navy-solid)]/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.4rem] bg-[var(--navy-solid)] px-5 py-4 text-white">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--amber-light)]">Pro Tips</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tips.map((tip) => (
                      <p key={tip} className="text-sm font-bold text-white/82">
                        • {tip}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm font-black text-[var(--text-muted)] hover:text-[var(--navy-solid)]"
                  >
                    Skip tutorial
                  </button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={step === 0}
                      onClick={() => setStep((current) => Math.max(current - 1, 0))}
                      className="min-h-11 flex-1 sm:flex-none"
                    >
                      <ChevronLeft size={17} className="mr-1" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (isLast) {
                          setOpen(false);
                          return;
                        }
                        setStep((current) => Math.min(current + 1, slides.length - 1));
                      }}
                      className="min-h-11 flex-1 sm:flex-none"
                    >
                      {isLast ? "Finish" : "Next"}
                      {!isLast ? <ChevronRight size={17} className="ml-1" /> : null}
                    </Button>
                  </div>
                </div>

                <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Created by Tharun.S.M
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
