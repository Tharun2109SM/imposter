"use client";

import { EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { submitClueAction } from "@/server/actions/room-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClueForm({ roomCode, playerId, word }: { roomCode: string; playerId: string; word: string }) {
  const [clue, setClue] = useState("");
  const [showClue, setShowClue] = useState(false);
  const action = useMemo(() => submitClueAction.bind(null, roomCode, playerId), [roomCode, playerId]);

  return (
    <form
      action={action}
      className="soft-enter relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F8E9D2_52%,#FFE2C0)] p-5 text-center text-[#33211D] shadow-[9px_10px_0_#233A5A,15px_16px_0_rgba(185,79,55,0.18),0_46px_100px_-62px_rgba(51,33,29,0.86)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218_58%,#4E2A84)] dark:text-[#F7EAD8] dark:shadow-[9px_10px_0_#0B080D,15px_16px_0_rgba(255,79,163,0.2),0_0_66px_-40px_rgba(49,215,198,0.74)] sm:p-9"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px),repeating-linear-gradient(45deg,rgba(51,33,29,0.045)_0_1px,transparent_1px_8px)] [background-size:8px_8px,14px_14px] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px),repeating-linear-gradient(45deg,rgba(247,234,216,0.05)_0_1px,transparent_1px_8px)]" />
      <div className="relative z-10 mx-auto mb-7 h-3 w-full max-w-lg rounded-full border-2 border-[#33211D] bg-[repeating-linear-gradient(90deg,#233A5A_0_18%,#F6B73C_18%_36%,#F67A3C_36%_54%,#D9829B_54%_72%,#69733F_72%_90%)] shadow-[3px_3px_0_rgba(51,33,29,0.28)] dark:border-[#0B080D] dark:bg-[repeating-linear-gradient(90deg,#31D7C6_0_18%,#FF9B42_18%_36%,#FF4FA3_36%_54%,#4E2A84_54%_72%,#F7EAD8_72%_90%)] dark:shadow-[3px_3px_0_#0B080D]" />
      <div className="relative z-10 mx-auto mb-8 max-w-md rounded-[1.35rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#F6B73C,#F67A3C)] px-5 py-4 shadow-[5px_5px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#31D7C6,#FF9B42)] dark:shadow-[5px_5px_0_#0B080D]">
        <span className="block text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#233A5A] dark:text-[#161218]">Secret Word</span>
        <strong className="display-font mt-2 block break-words text-[clamp(2.4rem,8vw,4.5rem)] leading-none text-[#33211D] dark:text-[#161218]">{word}</strong>
      </div>
      <h1 className="relative z-10 display-font text-[clamp(3rem,8vw,5.5rem)] leading-none drop-shadow-[4px_4px_0_rgba(246,183,60,0.62)] dark:drop-shadow-[4px_4px_0_rgba(255,79,163,0.35)]">Write your clue.</h1>
      <p className="relative z-10 mt-3 text-base font-bold text-[#775348] dark:text-[#F7EAD8]/78">Use one word to drop hints, but stay safe.</p>
      <div className="relative z-10 mt-8">
        <Input
          name="clue"
          value={clue}
          type={showClue ? "text" : "password"}
          placeholder="Type single word clue..."
          maxLength={15}
          autoFocus
          onChange={(event) => setClue(event.target.value.replace(/[^a-z]/gi, ""))}
          className="h-16 rounded-[1.15rem] border-[3px] border-[#33211D] bg-[#FFF6E8] pr-14 text-center text-lg font-black text-[#33211D] shadow-[inset_0_2px_0_rgba(255,255,255,0.72),4px_4px_0_rgba(51,33,29,0.28)] placeholder:text-[#9C6F5D] focus-visible:ring-[#F67A3C] dark:border-[#0B080D] dark:bg-[#161218] dark:text-[#F7EAD8] dark:shadow-[inset_0_2px_0_rgba(247,234,216,0.08),4px_4px_0_#0B080D] dark:placeholder:text-[#F7EAD8]/42 dark:focus-visible:ring-[#31D7C6]"
        />
        <button
          type="button"
          aria-label="Show clue"
          onClick={() => setShowClue((value) => !value)}
          className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-[#33211D] bg-[#F8E9D2] text-[#233A5A] shadow-[2px_2px_0_rgba(51,33,29,0.24)] transition hover:-translate-y-[55%] hover:bg-[#F6B73C] active:translate-y-[-45%] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[2px_2px_0_#0B080D]"
        >
          <EyeOff size={18} />
        </button>
      </div>
      <p className="relative z-10 mt-4 text-sm font-black uppercase tracking-[0.1em] text-[#775348] dark:text-[#F7EAD8]/68">Characters: {clue.length}/15</p>
      <Button type="submit" disabled={clue.length < 2} className="broadcast-button relative z-10 mt-8 min-h-14 w-full rounded-2xl px-7 text-sm uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-50">
        Submit Clue to Board
      </Button>
    </form>
  );
}
