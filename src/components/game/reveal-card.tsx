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
      className={`linen relative flex min-h-[320px] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-3xl border p-8 text-center shadow-2xl ${
        revealed ? "border-[var(--sage-solid)] bg-white" : "border-[#47433d] bg-[#302d29]"
      }`}
    >
      <div
        className="absolute inset-0 bg-[var(--sage-light)] transition-all duration-75"
        style={{
          clipPath: `circle(${progress}% at 50% 72%)`,
          opacity: revealed ? 0.25 : 0.55
        }}
      />
      <div className="relative z-10">
        {revealed ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Your Secret Word</p>
            <h2 className="display-font mt-4 text-5xl text-[var(--text-main)]">{word}</h2>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#d8d0c5]">Press & Hold</p>
            <p className="display-font mt-3 text-3xl text-[#f7efe4]">To Unveil</p>
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
        className="absolute bottom-8 left-8 right-8 z-20 rounded-xl bg-[var(--sage-solid)] px-5 py-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)]"
      >
        Press & Hold
      </button>
    </motion.div>
  );
}
