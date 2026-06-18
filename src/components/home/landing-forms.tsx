"use client";

import { Moon, MoveRight, Sparkles, Sun, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { createRoomAction, joinRoomAction } from "@/server/actions/room-actions";
import { formatRoomCode } from "@/lib/game/room-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Theme = "light" | "dark";

function LandingLabel({
  children,
  htmlFor,
  tone = "gold",
  theme
}: {
  children: React.ReactNode;
  htmlFor: string;
  tone?: "gold" | "coral";
  theme: Theme;
}) {
  const isDark = theme === "dark";

  return (
    <label
      htmlFor={htmlFor}
      className={`mb-3 inline-flex w-fit rounded-full border px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.13em] ${
        isDark
          ? tone === "gold"
            ? "border-2 border-[#0B080D] bg-[#FF9B42] text-[#161218] shadow-[3px_3px_0_#0B080D]"
            : "border-2 border-[#0B080D] bg-[#FF4FA3] text-[#161218] shadow-[3px_3px_0_#0B080D]"
          : tone === "gold"
            ? "border-2 border-[#33211D] bg-[linear-gradient(135deg,#6F4A21,#33211D)] text-[#FFE08A] shadow-[3px_3px_0_rgba(51,33,29,0.26)]"
            : "border-2 border-[#33211D] bg-[linear-gradient(135deg,#B84E35,#7F3B31)] text-[#FFE2C8] shadow-[3px_3px_0_rgba(51,33,29,0.26)]"
      }`}
    >
      {children}
    </label>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`pressable inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3.5 py-2 text-xs font-black uppercase tracking-[0.1em] transition duration-300 ${
        isDark
          ? "border-[#0B080D] bg-[#241B2F] text-[#F7EAD8] shadow-[4px_4px_0_#0B080D] hover:-translate-y-1 hover:bg-[#4E2A84] hover:shadow-[6px_7px_0_#0B080D,0_0_28px_-14px_rgba(49,215,198,0.85)]"
          : "border-[#33211D] bg-[linear-gradient(135deg,#FFF5DF,#F6B73C)] text-[#33211D] shadow-[4px_4px_0_#33211D,0_10px_24px_-18px_rgba(51,33,29,0.6)] hover:-translate-y-1 hover:bg-[#F6B73C] hover:shadow-[6px_7px_0_#33211D,0_0_28px_-12px_rgba(246,183,60,0.82)]"
      }`}
    >
      {isDark ? <Moon size={15} /> : <Sun size={15} />}
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

export function LandingForms() {
  const [roomCode, setRoomCode] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const searchParams = useSearchParams();
  const message = searchParams?.get("message");
  const isDark = theme === "dark";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("imposter-theme");
    const preferredTheme: Theme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(preferredTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("imposter-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-4 py-4 transition-colors duration-500 sm:h-screen sm:px-8 sm:py-4 ${
        isDark ? "bg-[#161218] text-[#F7EAD8]" : "bg-[#F8E9D2] text-[#33211D]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-0 transition duration-700 ${
          isDark
            ? "bg-[radial-gradient(circle_at_18%_12%,rgba(78,42,132,0.5),transparent_30rem),radial-gradient(circle_at_86%_18%,rgba(255,79,163,0.16),transparent_28rem),linear-gradient(135deg,#161218_0%,#241B2F_48%,#161218_100%)]"
            : "bg-[radial-gradient(circle_at_18%_12%,rgba(246,183,60,0.34),transparent_32rem),radial-gradient(circle_at_86%_18%,rgba(185,84,55,0.24),transparent_29rem),radial-gradient(circle_at_8%_88%,rgba(105,115,63,0.16),transparent_24rem),linear-gradient(135deg,#F8E9D2_0%,#F3D2AA_44%,#D9829B_112%)]"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 z-0 transition duration-700 [background-size:44px_44px] ${
          isDark
            ? "opacity-[0.08] [background-image:linear-gradient(90deg,rgba(247,234,216,0.26)_1px,transparent_1px),linear-gradient(rgba(247,234,216,0.18)_1px,transparent_1px)]"
            : "opacity-[0.16] [background-image:linear-gradient(90deg,rgba(51,33,29,0.22)_1px,transparent_1px),linear-gradient(rgba(51,33,29,0.18)_1px,transparent_1px)]"
        }`}
      />
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-40 transition duration-700 ${isDark ? "bg-[linear-gradient(180deg,rgba(49,215,198,0.08),transparent)]" : "bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent)]"}`} />
      {!isDark ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.16] mix-blend-multiply [background-image:radial-gradient(rgba(51,33,29,0.18)_0.65px,transparent_0.75px),repeating-linear-gradient(45deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_7px)] [background-position:0_0,0_0] [background-size:7px_7px,14px_14px]"
          aria-hidden="true"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className={`absolute -left-36 top-[-8rem] size-[34rem] rounded-full blur-[96px] ${isDark ? "bg-[#4E2A84]/44" : "bg-[#C45A35]/32"}`}
          animate={{ x: [0, 34, -18, 0], y: [0, 28, 52, 0], scale: [1, 1.06, 0.97, 1], opacity: [0.3, 0.44, 0.34, 0.3] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute right-[-11rem] top-[8rem] size-[32rem] rounded-full blur-[104px] ${isDark ? "bg-[#FF4FA3]/26" : "bg-[#F6B73C]/38"}`}
          animate={{ x: [0, -42, -22, 0], y: [0, 18, -22, 0], scale: [1, 0.94, 1.08, 1], opacity: [0.3, 0.42, 0.32, 0.3] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute left-[24%] top-[34%] size-[30rem] rounded-full blur-[110px] ${isDark ? "bg-[#31D7C6]/18" : "bg-[#D9829B]/30"}`}
          animate={{ x: [0, 24, 54, 0], y: [0, -28, 18, 0], scale: [1, 1.08, 1.01, 1], opacity: [0.26, 0.38, 0.3, 0.26] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-[-12rem] left-[6%] size-[38rem] rounded-full blur-[118px] ${isDark ? "bg-[#FF9B42]/24" : "bg-[#B94F37]/24"}`}
          animate={{ x: [0, 42, 16, 0], y: [0, -24, -52, 0], scale: [1, 0.98, 1.07, 1], opacity: [0.22, 0.34, 0.26, 0.22] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-[10%] right-[18%] size-[24rem] rounded-full blur-[92px] ${isDark ? "bg-[#4E2A84]/30" : "bg-[#69733F]/20"}`}
          animate={{ x: [0, -24, 20, 0], y: [0, 34, 14, 0], scale: [1, 1.1, 0.96, 1], opacity: [0.16, 0.26, 0.2, 0.16] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="relative z-40 mx-auto flex h-[4.75rem] w-full max-w-6xl items-center justify-between sm:-translate-x-6 lg:-translate-x-10">
        <div>
          <h1
            className={`display-font text-4xl leading-none sm:text-[3.35rem] ${isDark ? "text-[#F7EAD8] drop-shadow-[3px_3px_0_#0B080D]" : "text-[#33211D]"}`}
            style={
              isDark
                ? undefined
                : {
                    textShadow: "-0.8px -0.8px 0 #FFF5DF, 2px 2px 0 #F6B73C, 4px 4px 0 rgba(51,33,29,0.34)"
                  }
            }
          >
            Imposter.
          </h1>
          <p className={`mt-1.5 text-[0.78rem] font-black uppercase tracking-[0.2em] ${isDark ? "text-[#FF9B42]" : "text-[#775348]"}`}>Created by Tharun.S.M</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <HowToPlayModal theme={theme} />
        </div>
      </header>

      <section className="relative z-20 mx-auto flex min-h-[calc(100vh-5.75rem)] w-full max-w-6xl flex-col items-center justify-center gap-4 py-4 sm:h-[calc(100vh-5.75rem)] sm:min-h-0 sm:gap-5 sm:py-2">
        {message === "removed" ? (
          <div className={`w-full max-w-md rounded-2xl border px-5 py-3 text-center text-sm font-black ${isDark ? "border-2 border-[#0B080D] bg-[#FF4FA3] text-[#161218] shadow-[5px_5px_0_#0B080D]" : "border-[#E95843]/25 bg-[#FFF6E8]/70 text-[#33211D] shadow-[0_24px_70px_-42px_rgba(51,33,29,0.7)] backdrop-blur-2xl"}`}>
            You were removed by the host.
          </div>
        ) : null}
        {message === "room_closed" ? (
          <div className={`w-full max-w-md rounded-2xl border px-5 py-3 text-center text-sm font-black ${isDark ? "border-2 border-[#0B080D] bg-[#FF4FA3] text-[#161218] shadow-[5px_5px_0_#0B080D]" : "border-[#E95843]/25 bg-[#FFF6E8]/70 text-[#33211D] shadow-[0_24px_70px_-42px_rgba(51,33,29,0.7)] backdrop-blur-2xl"}`}>
            Room has been closed by the host.
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative w-full -translate-y-2 text-center sm:-translate-y-4"
        >
          <div className={`mx-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] ${isDark ? "border-2 border-[#0B080D] bg-[#31D7C6] text-[#161218] shadow-[4px_4px_0_#0B080D]" : "border-2 border-[#33211D] bg-[linear-gradient(135deg,#FFF4D8,#E9A65A)] text-[#233A5A] shadow-[4px_4px_0_rgba(51,33,29,0.24),0_18px_48px_-34px_rgba(51,33,29,0.7)]"}`}>
            <Sparkles size={15} />
            Retro game night, online
          </div>
          <div className="relative mx-auto mt-3 max-w-5xl">
            {isDark ? (
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-[min(84vw,39rem)] -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] rounded-[1.4rem] border-2 border-[#0B080D] bg-[repeating-linear-gradient(90deg,#4E2A84_0_1.2rem,#FF4FA3_1.2rem_1.55rem,#241B2F_1.55rem_2.7rem,#FF9B42_2.7rem_3rem)] opacity-45 shadow-[7px_7px_0_#0B080D]" aria-hidden="true" />
            ) : null}
            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 h-[15rem] w-[min(100vw,58rem)] -translate-x-1/2 -translate-y-1/2 ${isDark ? "opacity-[0.08]" : "opacity-[0.38]"}`}
              aria-hidden="true"
              style={{
                background:
                  isDark
                    ? "repeating-conic-gradient(from -10deg, rgba(49,215,198,0.4) 0deg 6deg, rgba(255,79,163,0.3) 6deg 10deg, rgba(255,155,66,0.26) 10deg 14deg, rgba(22,18,24,0) 14deg 24deg)"
                    : "repeating-conic-gradient(from -12deg, rgba(246,183,60,0.58) 0deg 5deg, rgba(194,90,53,0.18) 5deg 7deg, rgba(255,222,146,0.4) 7deg 10deg, rgba(248,233,210,0) 10deg 16deg)",
                maskImage: "radial-gradient(ellipse at center, black 0%, black 48%, transparent 82%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, black 48%, transparent 82%)"
              }}
            />
            <h2
              className={`display-font relative text-[clamp(3.25rem,9.2vw,6.85rem)] leading-[0.86] ${isDark ? "text-[#F7EAD8] drop-shadow-[6px_6px_0_#0B080D]" : "text-[#33211D]"}`}
              style={
                isDark
                  ? undefined
                  : {
                      textShadow: "-1px -1px 0 #FFF5DF, 4px 4px 0 #F6B73C, 8px 8px 0 rgba(82,50,34,0.42), 11px 11px 0 rgba(35,58,90,0.18)"
                    }
              }
            >
              Imposter.
            </h2>
          </div>
          <p className={`mx-auto mt-5 max-w-2xl text-balance text-base font-black leading-7 sm:mt-6 sm:text-xl ${isDark ? "text-[#F7EAD8]/82" : "text-[#233A5A]"}`}>
            Find the friend who is faking it.
          </p>

          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2.5 sm:mt-6">
            {["Secret words", "Sharp clues", "Messy votes"].map((item) => (
              <div key={item} className={`rounded-full border px-3.5 py-1.5 text-xs font-black transition duration-300 hover:scale-[1.03] ${isDark ? "border-2 border-[#0B080D] bg-[#241B2F] text-[#F7EAD8] shadow-[3px_3px_0_#0B080D] hover:bg-[#4E2A84] hover:shadow-[5px_5px_0_#0B080D]" : "border-2 border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F3D0A5)] text-[#33211D] shadow-[3px_3px_0_rgba(51,33,29,0.2)] hover:border-[#B94F37] hover:bg-[#FFF6E8] hover:shadow-[5px_5px_0_rgba(51,33,29,0.24)]"}`}>
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 130, damping: 18 }}
          className={`relative w-full max-w-5xl overflow-hidden rounded-[1.65rem] border-[3px] transition duration-500 sm:rounded-[1.9rem] ${
            isDark
              ? "border-[#0B080D] bg-[#241B2F] shadow-[8px_9px_0_#0B080D,14px_15px_0_rgba(255,79,163,0.2),0_0_46px_-22px_rgba(255,155,66,0.58)]"
              : "border-[#33211D] bg-[#F8E9D2]/88 shadow-[7px_8px_0_#233A5A,13px_14px_0_rgba(105,115,63,0.2),0_34px_82px_-44px_rgba(51,33,29,0.72),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-[18px]"
          }`}
        >
          <div className={`pointer-events-none absolute -right-16 -top-24 size-72 rounded-full blur-3xl ${isDark ? "bg-[#FF4FA3]/16" : "bg-[#F6B73C]/26"}`} />
          <div className={`pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full blur-3xl ${isDark ? "bg-[#31D7C6]/12" : "bg-[#B94F37]/18"}`} />
          {!isDark ? (
            <div className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px)] [background-size:8px_8px]" aria-hidden="true" />
          ) : null}

          <div className={`relative border-b-[3px] px-5 pb-4 pt-6 sm:px-7 ${isDark ? "border-[#0B080D] bg-[#4E2A84] text-[#F7EAD8]" : "border-[#33211D] bg-[linear-gradient(135deg,#233A5A,#1F304A)] text-[#F8E9D2]"}`}>
            <div
              className={`pointer-events-none absolute inset-x-7 top-3 h-px ${
                isDark
                  ? "h-1 rounded-full border border-[#0B080D] bg-[repeating-linear-gradient(90deg,#31D7C6_0_1.4rem,#FF4FA3_1.4rem_2.8rem,#FF9B42_2.8rem_4.2rem,#F7EAD8_4.2rem_5.6rem)] opacity-80 shadow-[2px_2px_0_#0B080D]"
                  : "h-1 rounded-full border border-[#33211D] bg-[repeating-linear-gradient(90deg,#F6B73C_0_1.4rem,#B94F37_1.4rem_2.8rem,#69733F_2.8rem_4.2rem,#F8E9D2_4.2rem_5.6rem)] opacity-90 shadow-[2px_2px_0_rgba(51,33,29,0.28)]"
              }`}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-2xl border-2 ${isDark ? "border-[#0B080D] bg-[#FF9B42] text-[#161218] shadow-[4px_4px_0_#0B080D]" : "border-[#33211D] bg-[#F6B73C] text-[#33211D] shadow-[4px_4px_0_#33211D]"}`}>
                  <UsersRound size={20} />
                </span>
                <div>
                  <p className={`display-font text-[1.65rem] leading-none ${isDark ? "text-[#F7EAD8]" : "text-[#F8E9D2]"}`}>Open the room</p>
                  <p className={`mt-1 text-xs font-bold sm:text-sm ${isDark ? "text-[#F7EAD8]/68" : "text-[#F8E9D2]/75"}`}>Host a table or jump into the chaos.</p>
                </div>
              </div>
              <div className={`inline-flex w-fit rounded-full border-2 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.12em] ${isDark ? "border-[#0B080D] bg-[#161218] text-[#31D7C6] shadow-[3px_3px_0_#0B080D]" : "border-[#33211D] bg-[linear-gradient(135deg,#D9829B,#B94F37)] text-[#FFF3DC] shadow-[3px_3px_0_#33211D]"}`}>
                Live party mode
              </div>
            </div>
          </div>

          <div className="relative grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <form action={createRoomAction} className={`relative flex min-h-[238px] flex-col justify-between border-b-[3px] p-5 md:border-b-0 md:border-r-[3px] sm:p-6 ${isDark ? "border-[#0B080D] bg-[#241B2F]" : "border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F9E5BF_72%,#F8E9D2)]"}`}>
              <div className={`pointer-events-none absolute right-5 top-5 size-7 rounded-full border-2 ${isDark ? "border-[#0B080D] bg-[#FF4FA3] shadow-[3px_3px_0_#0B080D]" : "border-transparent bg-[#D9829B] shadow-[3px_3px_0_#33211D]"}`} />
              <div>
                <p className={`mb-4 flex w-fit rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${isDark ? "border-[#0B080D] bg-[#FF9B42] text-[#161218] shadow-[3px_3px_0_#0B080D]" : "border-[#33211D] bg-[linear-gradient(135deg,#F8C853,#D99A25)] text-[#33211D] shadow-[3px_3px_0_#33211D]"}`}>
                  Host
                </p>
                <LandingLabel htmlFor="hostName" theme={theme}>Your Nickname</LandingLabel>
                <Input id="hostName" name="hostName" placeholder="e.g. Marcus" minLength={2} maxLength={24} required className={`border-2 transition duration-300 hover:-translate-y-0.5 ${isDark ? "!border-[#0B080D] !bg-[#F7EAD8] !text-[#161218] !shadow-[4px_4px_0_#0B080D] placeholder:!text-[#6C514B] hover:!border-[#FF9B42] hover:!shadow-[6px_6px_0_#0B080D]" : "!border-[#33211D] !bg-[#FFF9ED] !text-[#33211D] !shadow-[4px_4px_0_rgba(51,33,29,0.18)] placeholder:!text-[#8C5E4B] hover:!border-[#D99A25] hover:!shadow-[6px_6px_0_rgba(51,33,29,0.22)]"}`} />
              </div>
              <SubmitButton pendingText="Opening room..." className={`mt-5 min-h-12 w-full border-2 text-base transition duration-300 active:translate-x-1 active:translate-y-1 ${isDark ? "border-[#0B080D] bg-[#FF4FA3] text-[#161218] shadow-[5px_5px_0_#0B080D] hover:-translate-y-1 hover:scale-[1.01] hover:bg-[#FF9B42] hover:shadow-[7px_8px_0_#0B080D,0_0_34px_-12px_rgba(255,79,163,0.75)] active:shadow-[2px_2px_0_#0B080D]" : "border-[#33211D] bg-[linear-gradient(135deg,#2C486D,#233A5A)] text-[#FFF3DC] shadow-[5px_5px_0_#33211D] hover:-translate-y-1 hover:scale-[1.01] hover:bg-[#2D4B73] hover:shadow-[7px_8px_0_#33211D,0_0_34px_-12px_rgba(35,58,90,0.9)]"}`}>
                Start the Chaos
              </SubmitButton>
            </form>

            <form
              action={joinRoomAction}
              className={`relative flex min-h-[238px] flex-col justify-between p-5 sm:p-6 ${isDark ? "bg-[#4E2A84]" : "bg-[linear-gradient(135deg,#F7D7BD,#F4BE91_68%,#EFAF83)]"}`}
            >
              <div className={`pointer-events-none absolute right-6 top-6 h-6 w-12 rounded-full border-2 ${isDark ? "border-[#0B080D] bg-[#31D7C6] shadow-[3px_3px_0_#0B080D]" : "border-transparent bg-[#233A5A] shadow-[3px_3px_0_#33211D]"}`} />
              <div className="space-y-3">
                <p className={`inline-flex rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${isDark ? "border-[#0B080D] bg-[#31D7C6] text-[#161218] shadow-[3px_3px_0_#0B080D]" : "border-[#33211D] bg-[linear-gradient(135deg,#F67A3C,#B94F37)] text-[#33211D] shadow-[3px_3px_0_#33211D]"}`}>
                  Join
                </p>
                <div>
                  <LandingLabel htmlFor="roomCode" tone="coral" theme={theme}>Room Code</LandingLabel>
                  <Input
                    id="roomCode"
                    name="roomCode"
                    placeholder="W-A-R-M"
                    maxLength={7}
                    value={roomCode}
                    onChange={(event) => setRoomCode(formatRoomCode(event.target.value))}
                    required
                    className={`border-2 transition duration-300 hover:-translate-y-0.5 ${isDark ? "!border-[#0B080D] !bg-[#F7EAD8] !text-[#161218] !shadow-[4px_4px_0_#0B080D] placeholder:!text-[#6C514B] hover:!border-[#FF4FA3] hover:!shadow-[6px_6px_0_#0B080D]" : "!border-[#33211D] !bg-[#FFF9ED] !text-[#33211D] !shadow-[4px_4px_0_rgba(51,33,29,0.18)] placeholder:!text-[#8C5E4B] hover:!border-[#B94F37] hover:!shadow-[6px_6px_0_rgba(51,33,29,0.22)]"}`}
                  />
                </div>
                <div>
                  <LandingLabel htmlFor="playerName" tone="coral" theme={theme}>Your Nickname</LandingLabel>
                  <Input id="playerName" name="playerName" placeholder="e.g. Clara" minLength={2} maxLength={24} required className={`border-2 transition duration-300 hover:-translate-y-0.5 ${isDark ? "!border-[#0B080D] !bg-[#F7EAD8] !text-[#161218] !shadow-[4px_4px_0_#0B080D] placeholder:!text-[#6C514B] hover:!border-[#FF4FA3] hover:!shadow-[6px_6px_0_#0B080D]" : "!border-[#33211D] !bg-[#FFF9ED] !text-[#33211D] !shadow-[4px_4px_0_rgba(51,33,29,0.18)] placeholder:!text-[#8C5E4B] hover:!border-[#B94F37] hover:!shadow-[6px_6px_0_rgba(51,33,29,0.22)]"}`} />
                </div>
              </div>
              <SubmitButton pendingText="Joining..." variant="outline" className={`group mt-5 min-h-12 w-full border-2 text-base transition duration-300 active:translate-x-1 active:translate-y-1 ${isDark ? "border-[#0B080D] bg-[#31D7C6] text-[#161218] shadow-[5px_5px_0_#0B080D] hover:-translate-y-1 hover:scale-[1.01] hover:bg-[#FF9B42] hover:shadow-[7px_8px_0_#0B080D,0_0_34px_-12px_rgba(49,215,198,0.75)] active:shadow-[2px_2px_0_#0B080D]" : "border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F6B73C)] text-[#33211D] shadow-[5px_5px_0_#33211D] hover:-translate-y-1 hover:scale-[1.01] hover:bg-[#FFF6E8] hover:shadow-[7px_8px_0_#33211D,0_0_34px_-12px_rgba(246,183,60,0.9)]"}`}>
                Jump In
                <MoveRight className="ml-2 transition group-hover:translate-x-1" size={16} />
              </SubmitButton>
            </form>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
