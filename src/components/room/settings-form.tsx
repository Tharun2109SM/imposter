"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { updateSettingsAction } from "@/server/actions/room-actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="mode" value={activeMode} />
      <input type="hidden" name="pairCount" value={pairs.length} />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
          Mode
        </p>
        <div className="grid rounded-xl border border-[var(--border-cozy)] bg-[#fbf8f3] p-1 sm:w-72 sm:grid-cols-2">
          {(["OFFLINE", "ONLINE"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveMode(item)}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                activeMode === item
                  ? "bg-[var(--sage-solid)] text-white"
                  : "text-[var(--text-muted)] hover:bg-white"
              }`}
            >
              {item === "OFFLINE" ? "Offline" : "Online"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="totalPlayers">Total Players</Label>
          <Input id="totalPlayers" name="totalPlayers" type="number" min={3} max={16} defaultValue={totalPlayers} />
        </div>
        <div>
          <Label htmlFor="imposterCount">
            <span className={tooManyImposters ? "text-[var(--clay-solid)]" : ""}>Imposters</span>
          </Label>
          <Input id="imposterCount" name="imposterCount" type="number" min={1} max={4} defaultValue={imposterCount} />
          {tooManyImposters ? (
            <p className="mt-2 text-sm text-[var(--clay-solid)]">Needs at least two normal players.</p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Custom Words</p>
          <button
            type="button"
            className="text-sm font-medium text-[var(--sage-solid)]"
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
            <div className="rounded-2xl border border-dashed border-[var(--border-cozy)] p-8 text-center text-sm text-[var(--text-muted)]">
              A blank page invites new secrets. Start by typing your custom word pair, or pull from our curated archive.
            </div>
          ) : null}

          {pairs.map((pair, index) => (
            <div
              key={pair.id}
              className="grid items-center gap-3 rounded-2xl border border-[var(--border-cozy)] bg-[#fffdf9] p-3 sm:grid-cols-[2rem_1fr_auto_1fr_auto]"
            >
              <span className="text-sm text-[var(--text-muted)]">{index + 1}.</span>
              <input type="hidden" name={`pairId-${index}`} value={pair.id} />
              <Input name={`normal-${index}`} placeholder="Normal word" defaultValue={pair.normalWord} />
              <span className="display-font text-center text-lg italic text-[var(--text-muted)]">vs</span>
              <Input name={`imposter-${index}`} placeholder="Imposter word" defaultValue={pair.imposterWord} />
              <button
                type="button"
                aria-label="Remove word pair"
                onClick={() => setPairs((current) => current.filter((_, pairIndex) => pairIndex !== index))}
                className="inline-flex size-10 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--clay-light)] hover:text-[var(--clay-solid)]"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() =>
            setPairs((current) => [
              ...current,
              { id: `new-${current.length}`, normalWord: "", imposterWord: "", position: current.length }
            ])
          }
        >
          <Plus size={16} className="mr-2" />
          Add Word Pair
        </Button>
      </div>

      <Button type="submit" variant="outline" className="w-full">
        Save Settings
      </Button>
    </form>
  );
}
