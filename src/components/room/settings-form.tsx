"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { updateSettingsAction } from "@/server/actions/room-actions";
import { Input } from "@/components/ui/input";
import type { WordPair } from "@/lib/game/types";

type Props = {
  roomCode: string;
  mode: "OFFLINE" | "ONLINE";
  totalPlayers: number;
  imposterCount: number;
  wordPairs: WordPair[];
};

export function SettingsForm({ roomCode, mode, totalPlayers, imposterCount, wordPairs }: Props) {
  const [pairs, setPairs] = useState(wordPairs);
  const [activeMode, setActiveMode] = useState(mode);
  const action = useMemo(() => updateSettingsAction.bind(null, roomCode), [roomCode]);
  const tooManyImposters = imposterCount >= totalPlayers - 1;
  const labelClass = "mb-2 inline-flex w-fit rounded-full border-2 border-[#33211D] bg-[linear-gradient(135deg,#6F4A21,#33211D)] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.13em] text-[#FFE08A] shadow-[3px_3px_0_rgba(51,33,29,0.25)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#FF9B42,#4E2A84)] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]";
  const inputClass = "!h-12 !rounded-2xl !border-2 !border-[#33211D] !bg-[#FFF9ED] !px-4 !font-black !text-[#33211D] !shadow-[inset_2px_2px_0_rgba(51,33,29,0.12),4px_4px_0_rgba(51,33,29,0.18)] placeholder:!text-[#8C5E4B] focus:!border-[#B94F37] focus:!shadow-[inset_2px_2px_0_rgba(51,33,29,0.12),0_0_0_4px_rgba(246,183,60,0.22),5px_5px_0_rgba(51,33,29,0.2)] dark:!border-[#0B080D] dark:!bg-[#F7EAD8] dark:!text-[#161218] dark:!shadow-[inset_2px_2px_0_rgba(11,8,13,0.12),4px_4px_0_#0B080D] dark:placeholder:!text-[#6C514B] dark:focus:!border-[#31D7C6] dark:focus:!shadow-[inset_2px_2px_0_rgba(11,8,13,0.12),0_0_0_4px_rgba(49,215,198,0.18),5px_5px_0_#0B080D]";

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="mode" value={activeMode} />
      <input type="hidden" name="pairCount" value={pairs.length} />

      <div className="rounded-[1.5rem] border-2 border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F2D1A8)] p-4 shadow-[5px_5px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:shadow-[5px_5px_0_#0B080D]">
        <div className="mb-4 inline-flex rounded-full border-2 border-[#33211D] bg-[linear-gradient(135deg,#F67A3C,#B94F37)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#FF9B42,#FF4FA3)] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
          Room Settings
        </div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#775348] dark:text-[#F7EAD8]/62">Mode</p>
        <div className="grid gap-2 rounded-[1.25rem] border-2 border-[#33211D] bg-[#FFF9ED] p-1.5 shadow-[inset_2px_2px_0_rgba(51,33,29,0.1)] dark:border-[#0B080D] dark:bg-[#161218] sm:w-80 sm:grid-cols-2">
          {(["OFFLINE", "ONLINE"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveMode(item)}
              className={`pressable rounded-xl border-2 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
                activeMode === item
                  ? "border-[#33211D] bg-[linear-gradient(135deg,#F6B73C,#F67A3C)] text-[#33211D] shadow-[4px_4px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#31D7C6,#FF9B42)] dark:text-[#161218] dark:shadow-[4px_4px_0_#0B080D]"
                  : "border-transparent text-[#775348] hover:-translate-y-0.5 hover:bg-[#FFF3DC] dark:text-[#F7EAD8]/64 dark:hover:bg-[#241B2F]"
              }`}
            >
              {item === "OFFLINE" ? "Offline" : "Online"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="totalPlayers" className={labelClass}>Total Players</label>
          <div className="relative">
            <Input id="totalPlayers" name="totalPlayers" type="number" min={3} max={16} defaultValue={totalPlayers} className={`${inputClass} pr-12`} />
            <span className="pointer-events-none absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full border-2 border-[#33211D] bg-[#F6B73C] text-[0.62rem] font-black leading-none text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:shadow-[2px_2px_0_#0B080D]">↕</span>
          </div>
        </div>
        <div>
          <label htmlFor="imposterCount" className={labelClass}>Imposters</label>
          <div className="relative">
            <Input id="imposterCount" name="imposterCount" type="number" min={1} max={4} defaultValue={imposterCount} className={`${inputClass} pr-12`} />
            <span className="pointer-events-none absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full border-2 border-[#33211D] bg-[#D9829B] text-[0.62rem] font-black leading-none text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[2px_2px_0_#0B080D]">↕</span>
          </div>
          {tooManyImposters ? (
            <p className="mt-2 rounded-xl border-2 border-[#33211D] bg-[#D9829B] px-3 py-2 text-sm font-black text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[2px_2px_0_#0B080D]">Needs at least two normal players.</p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B94F37] dark:text-[#FF9B42]">Custom Words</p>
          <button
            type="button"
            className="rounded-full border-2 border-[#33211D] bg-[#FFF6E8] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#233A5A] shadow-[2px_2px_0_rgba(51,33,29,0.2)] transition hover:-translate-y-0.5 hover:bg-[#F6B73C] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[2px_2px_0_#0B080D]"
            onClick={() =>
              setPairs((current) => [
                ...current,
                { id: `new-${current.length}`, normalWord: "", imposterWord: "", position: current.length }
              ])
            }
          >
            Load Preset
          </button>
        </div>

        <div className="space-y-3">
          {pairs.length === 0 ? (
            <div className="rounded-[1.35rem] border-2 border-dashed border-[#33211D] bg-[#FFF6E8] p-8 text-center text-sm font-bold text-[#775348] shadow-[4px_4px_0_rgba(51,33,29,0.18)] dark:border-[#0B080D] dark:bg-[#161218] dark:text-[#F7EAD8]/64 dark:shadow-[4px_4px_0_#0B080D]">
              A blank page invites new secrets. Start by typing your custom word pair, or pull from our curated archive.
            </div>
          ) : null}

          {pairs.map((pair, index) => (
            <div
              key={pair.id}
              className="grid items-center gap-3 rounded-[1.35rem] border-2 border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F2D1A8)] p-3 shadow-[4px_4px_0_rgba(51,33,29,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:shadow-[4px_4px_0_#0B080D] dark:hover:shadow-[6px_6px_0_#0B080D] sm:grid-cols-[2rem_1fr_auto_1fr_auto]"
            >
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#33211D] bg-[#F6B73C] text-xs font-black text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:text-[#161218] dark:shadow-[2px_2px_0_#0B080D]">{index + 1}</span>
              <input type="hidden" name={`pairId-${index}`} value={pair.id} />
              <Input name={`normal-${index}`} placeholder="Normal word" defaultValue={pair.normalWord} className={inputClass} />
              <span className="display-font text-center text-2xl text-[#B94F37] drop-shadow-[2px_2px_0_rgba(246,183,60,0.42)] dark:text-[#FF9B42] dark:drop-shadow-[2px_2px_0_#0B080D]">VS</span>
              <Input name={`imposter-${index}`} placeholder="Imposter word" defaultValue={pair.imposterWord} className={inputClass} />
              <button
                type="button"
                aria-label="Remove word pair"
                onClick={() => setPairs((current) => current.filter((_, pairIndex) => pairIndex !== index))}
                className="pressable inline-flex size-11 items-center justify-center rounded-full border-2 border-[#33211D] bg-[#D9829B] text-[#33211D] shadow-[3px_3px_0_rgba(51,33,29,0.24)] hover:-translate-y-0.5 hover:bg-[#B94F37] hover:text-[#FFF3DC] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="pressable mt-4 inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F6B73C)] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#33211D] shadow-[5px_5px_0_#33211D] transition hover:-translate-y-1 hover:shadow-[7px_8px_0_#33211D,0_0_34px_-14px_rgba(246,183,60,0.82)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#31D7C6,#FF9B42)] dark:text-[#161218] dark:shadow-[5px_5px_0_#0B080D] dark:hover:shadow-[7px_8px_0_#0B080D,0_0_34px_-14px_rgba(49,215,198,0.72)]"
          onClick={() =>
            setPairs((current) => [
              ...current,
              { id: `new-${current.length}`, normalWord: "", imposterWord: "", position: current.length }
            ])
          }
        >
          <Plus size={16} className="mr-2" />
          Add Word Pair
        </button>
      </div>

      <button type="submit" className="pressable min-h-13 w-full rounded-2xl border-2 border-[#33211D] bg-[linear-gradient(135deg,#233A5A,#1F304A)] px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#FFF3DC] shadow-[5px_5px_0_#33211D] transition hover:-translate-y-1 hover:shadow-[7px_8px_0_#33211D,0_0_34px_-14px_rgba(35,58,90,0.82)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#FF4FA3,#4E2A84)] dark:text-[#F7EAD8] dark:shadow-[5px_5px_0_#0B080D] dark:hover:shadow-[7px_8px_0_#0B080D,0_0_34px_-14px_rgba(255,79,163,0.72)]">
        Save Settings
      </button>
    </form>
  );
}
