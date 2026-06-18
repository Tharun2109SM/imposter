"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Crown,
  DoorOpen,
  EyeOff,
  HelpCircle,
  MessageCircle,
  Search,
  ShieldAlert,
  Trophy,
  Vote,
  X,
  type LucideIcon
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

type ManualStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const steps: ManualStep[] = [
  {
    title: "Create or join a room.",
    description: "Start a fresh table or enter a friend's room code.",
    icon: DoorOpen
  },
  {
    title: "Host enters word pairs.",
    description: "The host prepares matching and imposter words for the round.",
    icon: BookOpen
  },
  {
    title: "Most players receive the same word.",
    description: "The majority quietly shares one secret word.",
    icon: EyeOff
  },
  {
    title: "One or more imposters receive a different word.",
    description: "One or more players get a related word and need to blend in.",
    icon: ShieldAlert
  },
  {
    title: "Take turns giving clues.",
    description: "Give a clue that proves you belong without giving the game away.",
    icon: MessageCircle
  },
  {
    title: "Avoid revealing your word directly.",
    description: "Good clues are helpful to teammates and dangerous for imposters.",
    icon: Search
  },
  {
    title: "Vote for the suspected imposter.",
    description: "Listen to the table, trust your read, and lock in a vote.",
    icon: Vote
  },
  {
    title: "Reveal identities.",
    description: "Flip the round open and see who survived the table.",
    icon: Crown
  },
  {
    title: "Earn bragging rights.",
    description: "Win the round, talk your nonsense, then run it back.",
    icon: Trophy
  }
];

export function HowToPlayModal({ theme = "light" }: { theme?: Theme }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const isDark = theme === "dark";
  const currentStep = steps[step];
  const isLast = step === steps.length - 1;
  const CurrentIcon = currentStep.icon;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setStep((current) => Math.min(current + 1, steps.length - 1));
      if (event.key === "ArrowLeft") setStep((current) => Math.max(current - 1, 0));
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const modal = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
            isDark ? "bg-[#050407]/82" : "bg-[#33211D]/72 backdrop-blur-xl"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-3 sm:p-4 ${
              isDark
                ? "border-[3px] border-[#0B080D] bg-[#241B2F] text-[#F7EAD8] shadow-[8px_9px_0_#0B080D,14px_15px_0_rgba(255,79,163,0.22),0_44px_120px_-48px_rgba(0,0,0,0.95)]"
                : "border-[3px] border-[#33211D] bg-[#F8E9D2] text-[#33211D] shadow-[0_48px_140px_-52px_rgba(51,33,29,0.9),8px_8px_0_#233A5A]"
            }`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 170, damping: 19 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div
              className={`relative overflow-hidden rounded-[1.6rem] p-5 sm:p-7 ${
                isDark
                  ? "border-[3px] border-[#0B080D] bg-[linear-gradient(135deg,#161218,#241B2F_54%,#4E2A84)] shadow-[inset_0_0_0_1px_rgba(247,234,216,0.08)]"
                  : "bg-[linear-gradient(135deg,#FFF3DC,#F8E9D2_48%,#F1C1CC)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
              }`}
            >
              <div className={`pointer-events-none absolute -right-20 -top-20 size-64 rounded-full blur-3xl ${isDark ? "bg-[#FF4FA3]/14" : "bg-[#F6B73C]/26"}`} />
              <div className={`pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full blur-3xl ${isDark ? "bg-[#31D7C6]/10" : "bg-[#F67A3C]/20"}`} />
              <div className={`pointer-events-none absolute left-5 top-5 size-5 rotate-12 rounded-md border-2 ${isDark ? "border-[#0B080D] bg-[#31D7C6] shadow-[3px_3px_0_#0B080D]" : "border-transparent bg-[#E95843] shadow-[3px_3px_0_#33211D]"}`} />

              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="relative">
                  <p className={`text-xs font-black uppercase tracking-[0.18em] ${isDark ? "text-[#FF9B42]" : "text-[#E95843]"}`}>
                    Manual Step {step + 1} / {steps.length}
                  </p>
                  <h2
                    id={titleId}
                    className={`display-font mt-2 text-4xl leading-tight sm:text-5xl ${
                      isDark
                        ? "text-[#F7EAD8] drop-shadow-[4px_4px_0_#0B080D]"
                        : "text-[#33211D] drop-shadow-[3px_3px_0_rgba(246,183,60,0.55)]"
                    }`}
                  >
                    How To Play Imposter.
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close how to play"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    setOpen(false);
                  }}
                  onClick={() => setOpen(false)}
                  className={`pressable relative flex size-11 shrink-0 items-center justify-center rounded-2xl border transition duration-300 hover:-translate-y-1 hover:scale-[1.04] ${
                    isDark
                      ? "border-2 border-[#0B080D] bg-[#FF4FA3] text-[#161218] shadow-[4px_4px_0_#0B080D] hover:bg-[#FF9B42] hover:shadow-[6px_6px_0_#0B080D]"
                      : "border-2 border-[#33211D] bg-[#233A5A] text-[#F8E9D2] shadow-[4px_4px_0_#33211D] hover:bg-[#E95843]"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                <div
                  className={`relative flex min-h-64 flex-col justify-between rounded-[1.6rem] border p-5 ${
                    isDark
                      ? "border-[3px] border-[#0B080D] bg-[#4E2A84] shadow-[6px_6px_0_#0B080D]"
                      : "border-2 border-[#33211D] bg-[linear-gradient(135deg,#F6B73C,#F67A3C,#D9829B)] shadow-[5px_5px_0_#33211D]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex size-16 items-center justify-center rounded-3xl border ${
                        isDark
                          ? "border-2 border-[#0B080D] bg-[#31D7C6] text-[#161218] shadow-[4px_4px_0_#0B080D]"
                          : "border-2 border-[#33211D] bg-[#F8E9D2] text-[#33211D] shadow-[4px_4px_0_#33211D]"
                      }`}
                    >
                      <CurrentIcon size={30} />
                    </span>
                    <span className={`text-5xl font-black ${isDark ? "text-[#FF9B42]/32" : "text-[#33211D]/16"}`}>
                      {String(step + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <h3 className={`mt-8 text-2xl font-black leading-tight ${isDark ? "text-[#F7EAD8]" : "text-[#33211D]"}`}>
                      {currentStep.title}
                    </h3>
                    <p className={`mt-3 text-sm font-bold leading-6 ${isDark ? "text-[#F7EAD8]/78" : "text-[#33211D]/72"}`}>
                      {currentStep.description}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {steps.map((manualStep, index) => {
                      const StepIcon = manualStep.icon;
                      const isActive = index === step;

                      return (
                        <button
                          key={manualStep.title}
                          type="button"
                          onClick={() => setStep(index)}
                          className={`group flex min-h-20 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition duration-300 hover:-translate-y-0.5 ${
                            isDark
                              ? isActive
                                ? "border-2 border-[#0B080D] bg-[#FF9B42] text-[#161218] shadow-[4px_4px_0_#0B080D]"
                                : "border-2 border-[#0B080D] bg-[#241B2F] text-[#F7EAD8] shadow-[3px_3px_0_#0B080D] hover:bg-[#4E2A84] hover:shadow-[5px_5px_0_#0B080D]"
                              : isActive
                                ? "border-2 border-[#33211D] bg-[#F6B73C] text-[#33211D] shadow-[3px_3px_0_#33211D]"
                                : "border-2 border-[#33211D]/12 bg-[#FFF9ED]/70 text-[#33211D]/72 hover:border-[#33211D]/24 hover:bg-[#FFF9ED]"
                          }`}
                        >
                          <StepIcon className="shrink-0" size={17} />
                          <span className="text-xs font-black leading-4">{manualStep.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className={`text-sm font-black transition duration-300 ${isDark ? "text-[#F7EAD8]/72 hover:text-[#31D7C6]" : "text-[#775348] hover:text-[#E95843]"}`}
                    >
                      Skip tutorial
                    </button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={step === 0}
                        onClick={() => setStep((current) => Math.max(current - 1, 0))}
                        className={`min-h-11 flex-1 transition duration-300 hover:scale-[1.015] sm:flex-none ${
                          isDark ? "border-2 border-[#0B080D] bg-[#F7EAD8] text-[#161218] shadow-[4px_4px_0_#0B080D] hover:bg-[#31D7C6] hover:shadow-[6px_6px_0_#0B080D]" : ""
                        }`}
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
                          setStep((current) => Math.min(current + 1, steps.length - 1));
                        }}
                        className={`min-h-11 flex-1 transition duration-300 hover:scale-[1.015] sm:flex-none ${
                          isDark ? "border-2 border-[#0B080D] bg-[#FF4FA3] text-[#161218] shadow-[4px_4px_0_#0B080D] hover:bg-[#FF9B42] hover:shadow-[6px_6px_0_#0B080D]" : ""
                        }`}
                      >
                        {isLast ? "Finish" : "Next"}
                        {!isLast ? <ChevronRight size={17} className="ml-1" /> : null}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
        className={`pressable relative inline-flex min-h-11 items-center gap-2 overflow-hidden text-xs font-black uppercase tracking-[0.1em] transition duration-300 hover:-translate-y-1 hover:scale-[1.025] ${
          isDark
            ? "rounded-[0.85rem] border-2 border-[#0B080D] bg-[#FF9B42] px-5 py-2 text-[#161218] shadow-[4px_4px_0_#0B080D] hover:bg-[#31D7C6] hover:shadow-[6px_7px_0_#0B080D,0_0_28px_-10px_rgba(49,215,198,0.82)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#0B080D]"
            : "ticket-button rounded-[0.85rem] border-2 border-[#33211D] bg-[#F6B73C] px-5 py-2 text-[#33211D] shadow-[4px_4px_0_#33211D] hover:bg-[#F8E9D2] hover:shadow-[6px_7px_0_#33211D,0_0_28px_-10px_rgba(246,183,60,0.95)]"
        }`}
      >
        <HelpCircle size={16} />
        How To Play
      </button>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
