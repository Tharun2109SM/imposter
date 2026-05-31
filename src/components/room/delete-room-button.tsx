"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRoomAction } from "@/server/actions/room-actions";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const errorMessages = {
  ROOM_NOT_FOUND: "Room already deleted.",
  UNAUTHORIZED: "Unauthorized request.",
  DATABASE_FAILURE: "Could not delete the room. Please try again."
};

export function DeleteRoomButton({
  roomCode,
  requesterPlayerId,
  compact = false
}: {
  roomCode: string;
  requesterPlayerId: string;
  compact?: boolean;
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
        className={compact ? "min-h-10 px-4" : "w-full"}
      >
        <Trash2 size={16} className={compact ? "mr-2" : "mr-2"} />
        Delete Room
      </Button>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2824]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Panel className="w-full max-w-sm space-y-6 border border-[var(--border-cozy)] bg-[#faf6f0] p-6 text-center shadow-2xl">
            <div>
              <h3 className="display-font text-2xl text-[var(--clay-solid)]">Delete this room?</h3>
              <p className="mt-3 whitespace-pre-line text-sm text-[var(--text-muted)]">
                This will remove the room and disconnect all players.
                {"\n"}This action cannot be undone.
              </p>
              {error ? <p className="mt-4 text-sm font-semibold text-[var(--clay-solid)]">{error}</p> : null}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="h-11 flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
                className="h-11 flex-1"
              >
                {isPending ? "Deleting..." : "Delete Room"}
              </Button>
            </div>
          </Panel>
        </div>
      ) : null}
    </>
  );
}
