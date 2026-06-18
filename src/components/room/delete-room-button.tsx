"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRoomAction } from "@/server/actions/room-actions";
import { Button } from "@/components/ui/button";

const errorMessages = {
  ROOM_NOT_FOUND: "Room already deleted.",
  UNAUTHORIZED: "Unauthorized request.",
  DATABASE_FAILURE: "Could not delete the room. Please try again."
};

export function DeleteRoomButton({
  roomCode,
  requesterPlayerId,
  compact = false,
  label = "Delete Room",
  className
}: {
  roomCode: string;
  requesterPlayerId: string;
  compact?: boolean;
  label?: string;
  className?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteRoomAction(roomCode, requesterPlayerId).catch(() => ({
        ok: false as const,
        error: "DATABASE_FAILURE" as const
      }));

      if (!result.ok) {
        setError(errorMessages[result.error]);
        return;
      }

      window.dispatchEvent(
        new CustomEvent("room:trigger-refresh", {
          detail: { message: "room_closed" }
        })
      );
      router.push("/?message=room_closed");
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          setError(null);
          setShowConfirm(true);
        }}
        className={className ?? (compact ? "min-h-10 px-4" : "w-full")}
      >
        <Trash2 size={16} className={compact ? "mr-2" : "mr-2"} />
        {label}
      </Button>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2824]/62 p-4 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-[#050407]/76">
          <div className="soft-enter relative w-full max-w-sm overflow-hidden rounded-[1.9rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F2D1A8)] p-6 text-center shadow-[8px_9px_0_#33211D,0_44px_120px_-48px_rgba(0,0,0,0.78)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:text-[#F7EAD8] dark:shadow-[8px_9px_0_#0B080D,14px_15px_0_rgba(255,79,163,0.2)]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px)] [background-size:8px_8px] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px)]" />
            <div className="relative space-y-6">
            <div>
              <div className="mx-auto mb-4 inline-flex rounded-full border-2 border-[#33211D] bg-[linear-gradient(135deg,#E95843,#B94F37)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF3DC] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#FF4FA3,#4E2A84)] dark:text-[#F7EAD8] dark:shadow-[3px_3px_0_#0B080D]">
                Warning Signal
              </div>
              <h3 className="display-font text-3xl leading-none text-[#B94F37] drop-shadow-[3px_3px_0_rgba(246,183,60,0.44)] dark:text-[#FF9B42] dark:drop-shadow-[3px_3px_0_#0B080D]">Delete this room?</h3>
              <p className="mt-4 whitespace-pre-line text-sm font-bold leading-6 text-[#775348] dark:text-[#F7EAD8]/70">
                This will remove the room and disconnect all players.
                {"\n"}This action cannot be undone.
              </p>
              {error ? <p className="mt-4 rounded-xl border-2 border-[#33211D] bg-[#D9829B] px-3 py-2 text-sm font-black text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[2px_2px_0_#0B080D]">{error}</p> : null}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="pressable min-h-12 flex-1 rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#33211D] shadow-[4px_4px_0_#33211D] transition hover:-translate-y-1 hover:bg-[#F6B73C] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#33211D] disabled:opacity-60 dark:border-[#0B080D] dark:bg-[#F7EAD8] dark:text-[#161218] dark:shadow-[4px_4px_0_#0B080D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="pressable min-h-12 flex-1 rounded-2xl border-2 border-[#33211D] bg-[linear-gradient(135deg,#E95843,#B94F37)] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#FFF3DC] shadow-[4px_4px_0_#33211D] transition hover:-translate-y-1 hover:shadow-[6px_7px_0_#33211D,0_0_30px_-14px_rgba(233,88,67,0.85)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#33211D] disabled:opacity-60 dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#FF4FA3,#4E2A84)] dark:text-[#F7EAD8] dark:shadow-[4px_4px_0_#0B080D]"
              >
                {isPending ? "Deleting..." : "Delete Room"}
              </button>
            </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
