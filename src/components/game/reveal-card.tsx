"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function RevealCard({ word }: { word: string }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!holding) {
      setProgress(0);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    startedAtRef.current = performance.now();

    const tick = (time: number) => {
      const nextProgress = Math.min(100, ((time - startedAtRef.current) / 1500) * 100);
      setProgress(nextProgress);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [holding]);

  const revealed = progress >= 100;

  return (
    <motion.div
      animate={{ scale: holding ? 1.03 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`relative flex min-h-[360px] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-8 text-center shadow-[var(--shadow-lifted)] backdrop-blur ${
        revealed ? "border-white/60 bg-white/72" : "border-white/20 bg-[rgba(21,35,61,0.62)]"
      }`}
    >
      <div className="absolute -top-16 left-1/2 size-44 -translate-x-1/2 rounded-full bg-[var(--amber-solid)]/30 blur-3xl" />
      <div className="absolute -bottom-20 right-0 size-52 rounded-full bg-[var(--coral-solid)]/25 blur-3xl" />
      <div
        className="absolute inset-0 bg-[var(--amber-solid)] transition-all duration-75"
        style={{
          clipPath: `circle(${progress}% at 50% 72%)`,
          opacity: revealed ? 0.25 : 0.55
        }}
      />
      <div className="relative z-10">
        {revealed ? (
          <>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--clay-solid)]">Your Secret Word</p>
            <h2 className="display-font mt-4 text-6xl text-[var(--text-main)]">{word}</h2>
          </>
        ) : (
          <>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ffe6a6]">Press & Hold</p>
            <p className="display-font mt-3 text-5xl text-white">To Unveil</p>
            <p className="mt-6 font-mono text-sm text-[#d8d0c5]">{Math.round(progress)}%</p>
          </>
        )}
      </div>
      <button
        type="button"
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        onPointerLeave={() => setHolding(false)}
        className="pressable absolute bottom-8 left-8 right-8 z-20 rounded-xl bg-[var(--sage-solid)] px-5 py-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--sage-hover)] hover:shadow-[var(--shadow-hover)] focus-ring"
      >
        Press & Hold
      </button>
    </motion.div>
  );
}
