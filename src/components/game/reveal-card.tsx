"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export function RevealCard({ word }: { word: string; isImposter?: boolean }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const progressRef = useRef(0);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    if (!holding) {
      const resetStartedAt = performance.now();
      const initialProgress = progressRef.current;

      const easeOut = (time: number) => {
        const elapsed = Math.min(1, (time - resetStartedAt) / 260);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const nextProgress = initialProgress * (1 - eased);
        const softenedProgress = nextProgress < 0.5 ? 0 : nextProgress;
        progressRef.current = softenedProgress;
        setProgress(softenedProgress);

        if (elapsed < 1) {
          frameRef.current = requestAnimationFrame(easeOut);
        }
      };

      frameRef.current = requestAnimationFrame(easeOut);
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }

    startedAtRef.current = performance.now();

    const tick = (time: number) => {
      const nextProgress = Math.min(100, ((time - startedAtRef.current) / 1500) * 100);
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [holding]);

  const revealed = progress >= 100;
  const blocksFilled = Math.min(10, Math.floor(progress / 10));
  const bootLine = progress < 34 ? "LOADING..." : progress < 72 ? "ACCESS..." : "READY...";
  const showReveal = holding && revealed;
  const showProgress = progress > 0 && !showReveal;
  const holdRatio = progress / 100;
  const screenStyle = {
    "--hold-progress": holdRatio,
    "--hold-progress-percent": `${progress}%`
  } as CSSProperties;

  const stopHolding = () => {
    setHolding(false);
  };

  return (
    <div
      onPointerLeave={() => {
        if (holding) stopHolding();
      }}
      className="handheld-console relative w-[min(92vw,29rem)] rounded-[2.45rem] p-3 text-center sm:p-5"
      style={screenStyle}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-2 flex shrink-0 items-center justify-between px-2">
          <div className="rounded-full border-2 border-[#33211D] bg-[#FFF6E8] px-3 py-1 text-[0.64rem] font-black uppercase tracking-[0.12em] text-[#233A5A] shadow-[2px_2px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[2px_2px_0_#0B080D]">
            Imposter Pocket 84
          </div>
          <div className="flex items-center gap-3 text-[0.64rem] font-black uppercase tracking-[0.12em] text-[#33211D] dark:text-[#F7EAD8]">
            <span className="flex items-center gap-1.5">
              <span className="handheld-led size-2.5 rounded-full bg-[#FF9B42] text-[#FF9B42]" />
              Bat
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`handheld-led size-2.5 rounded-full ${
                  holding && revealed ? "bg-[#31D7C6] text-[#31D7C6]" : holding ? "bg-[#FF9B42] text-[#FF9B42]" : "bg-[#E95843] text-[#E95843]"
                }`}
              />
              Power
            </span>
          </div>
        </div>

        <div className="mx-auto mb-3 h-5 w-48 shrink-0 rounded-b-2xl border-x-2 border-b-2 border-[#33211D] bg-[linear-gradient(180deg,#6F4A21,#33211D)] shadow-[3px_3px_0_rgba(51,33,29,0.2)] dark:border-[#0B080D] dark:bg-[linear-gradient(180deg,#4E2A84,#0B080D)] dark:shadow-[3px_3px_0_#0B080D]">
          <div className="mx-auto h-2 w-32 rounded-b-full bg-[#FFF6E8]/22 dark:bg-[#F7EAD8]/12" />
        </div>

        <div className="shrink-0 rounded-[1.85rem] border-[3px] border-[#33211D] bg-[#233A5A] p-3 shadow-[inset_0_2px_0_rgba(255,255,255,0.14),4px_4px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[#0B080D] dark:shadow-[inset_0_2px_0_rgba(247,234,216,0.08),4px_4px_0_#0B080D] sm:p-3.5">
          <div className="mb-2 flex items-center justify-between px-1 font-mono text-[0.7rem] font-black uppercase tracking-[0.12em] text-[#F7EAD8]/64">
            <span>LCD Secret View</span>
            <span>BAT 84%</span>
          </div>
          <div
            className={`handheld-screen h-[16.25rem] rounded-[1.45rem] p-5 ${
              holding ? "handheld-screen-active" : ""
            } ${showReveal ? "handheld-screen-revealed" : ""}`}
          >
            <div className="relative z-10 h-full overflow-hidden">
              <div className={`handheld-screen-state ${!showProgress && !showReveal ? "handheld-screen-state-visible" : ""}`}>
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="lcd-boot-stack relative h-24 w-full max-w-80 overflow-hidden">
                    {["POWER ON...", "Loading Cartridge...", "Connecting...", "Player Ready"].map((line, index) => (
                      <p
                        key={line}
                        className="lcd-boot-line lcd-text absolute inset-x-0 top-1/2 -translate-y-1/2 font-mono text-base font-black uppercase tracking-[0.16em]"
                        style={{ animationDelay: `${index * 430}ms` }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                  <p className="lcd-text mt-2 font-mono text-base font-black uppercase tracking-[0.18em]">Your Secret Word</p>
                  <p className="lcd-text mt-3 font-mono text-[clamp(2.55rem,9vw,4.25rem)] font-black uppercase leading-none">
                    Hold To Reveal
                  </p>
                  <div className="pixel-loader mt-6 h-3.5 w-32 rounded-sm bg-[repeating-linear-gradient(90deg,#223A2C_0_0.55rem,transparent_0.55rem_0.9rem)] opacity-65" />
                </div>
              </div>

              <div className={`handheld-screen-state ${showProgress ? "handheld-screen-state-visible" : ""}`}>
                <div className="flex h-full flex-col items-center justify-center">
                  <p className="lcd-text font-mono text-base font-black uppercase tracking-[0.18em]">{bootLine}</p>
                  <div className="mt-6 h-6 w-full max-w-80 rounded-md border-2 border-[#223A2C] bg-[#223A2C]/18 p-1">
                    <div className="handheld-screen-progress h-full rounded-sm bg-[#223A2C]" />
                  </div>
                  <p className="lcd-text mt-5 font-mono text-base font-black">{Math.round(progress)}%</p>
                </div>
              </div>

              <div className={`handheld-screen-state ${showReveal ? "handheld-screen-state-visible" : ""}`}>
                <div className="flex h-full flex-col items-center justify-center">
                  <p className="lcd-text mt-2 font-mono text-base font-black uppercase tracking-[0.18em]">Your Word</p>
                  <h2 className="lcd-text display-font mt-3 max-w-full break-words text-[clamp(2.1rem,8vw,3.65rem)] leading-none">
                    {word}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid shrink-0 grid-cols-[1fr_auto_1fr] items-end gap-3 sm:gap-4">
          <div className="grid place-items-center">
            <div className="relative size-24 sm:size-28">
              <span className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 rounded-lg border-2 border-[#33211D] bg-[#233A5A] shadow-[3px_3px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#4E2A84] dark:shadow-[3px_3px_0_#0B080D]" />
              <span className="absolute left-0 top-1/2 h-10 w-full -translate-y-1/2 rounded-lg border-2 border-[#33211D] bg-[#233A5A] shadow-[3px_3px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#4E2A84] dark:shadow-[3px_3px_0_#0B080D]" />
            </div>
          </div>

          <div className="grid gap-2 pb-1">
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: 7 }).map((_, index) => (
                <span key={index} className="h-9 w-2 rounded-full border border-[#33211D] bg-[#33211D]/28 dark:border-[#0B080D] dark:bg-[#F7EAD8]/20" />
              ))}
            </div>
            <div className="flex justify-center gap-3 text-[0.64rem] font-black uppercase tracking-[0.12em] text-[#33211D] dark:text-[#F7EAD8]/70">
              <span>Select</span>
              <span>Start</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="grid size-14 place-items-center rounded-full border-2 border-[#33211D] bg-[#D9829B] text-base font-black text-[#33211D] shadow-[4px_4px_0_rgba(51,33,29,0.26)] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[4px_4px_0_#0B080D] sm:size-16">B</span>
            <span className="grid size-14 place-items-center rounded-full border-2 border-[#33211D] bg-[#F67A3C] text-base font-black text-[#33211D] shadow-[4px_4px_0_rgba(51,33,29,0.26)] dark:border-[#0B080D] dark:bg-[#FF9B42] dark:text-[#161218] dark:shadow-[4px_4px_0_#0B080D] sm:size-16">A</span>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setHolding(true);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            stopHolding();
          }}
          onPointerCancel={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            stopHolding();
          }}
          className={`handheld-reveal-button mt-auto inline-flex h-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#33211D] px-6 py-3 text-base font-black uppercase tracking-[0.14em] focus-ring dark:border-[#0B080D] ${
            holding ? "handheld-reveal-button-pressed" : ""
          }`}
        >
          {holding ? "Holding Start" : "Hold To Reveal"}
        </button>

        <div className="mt-4 flex h-3 shrink-0 items-center justify-center gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className={`h-2 flex-1 rounded-full border border-[#33211D] dark:border-[#0B080D] ${
                index < blocksFilled && holding ? "bg-[#31D7C6]" : "bg-[#33211D]/16 dark:bg-[#F7EAD8]/12"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
