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
    <form action={action} className="soft-enter mx-auto max-w-xl rounded-3xl border border-[var(--border-cozy)] bg-white p-6 text-center shadow-[var(--shadow-lifted)] sm:p-10">
      <div className="mx-auto mb-8 inline-flex items-center gap-3 rounded-2xl bg-[var(--sage-light)] px-5 py-3">
        <span className="text-sm text-[var(--text-muted)]">Your Secret Word:</span>
        <strong className="text-xl text-[var(--sage-solid)]">{word}</strong>
      </div>
      <h1 className="display-font text-5xl leading-tight">Write your clue.</h1>
      <p className="mt-2 text-[var(--text-muted)]">Use one word to drop hints, but stay safe.</p>
      <div className="relative mt-8">
        <Input
          name="clue"
          value={clue}
          type={showClue ? "text" : "password"}
          placeholder="Type single word clue..."
          maxLength={15}
          autoFocus
          onChange={(event) => setClue(event.target.value.replace(/[^a-z]/gi, ""))}
          className="h-14 pr-12 text-center text-lg"
        />
        <button
          type="button"
          aria-label="Show clue"
          onClick={() => setShowClue((value) => !value)}
          className="absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[#f4efeb]"
        >
          <EyeOff size={18} />
        </button>
      </div>
      <p className="mt-3 text-sm text-[var(--text-muted)]">Characters: {clue.length}/15</p>
      <Button type="submit" disabled={clue.length < 2} className="mt-8 min-h-14 w-full disabled:cursor-not-allowed disabled:opacity-50">
        Submit Clue to Board
      </Button>
    </form>
  );
}
