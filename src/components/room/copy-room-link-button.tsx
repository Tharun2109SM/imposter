"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyRoomLinkButton({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false);
  const roomUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/room/${roomCode}`;
  }, [roomCode]);

  return (
    <Button
      type="button"
      variant={copied ? "primary" : "outline"}
      className="min-h-11 rounded-full !border-2 !border-[#33211D] !bg-[#FFF3DC] px-4 text-xs !font-black uppercase tracking-[0.12em] !text-[#233A5A] !shadow-[3px_3px_0_#33211D] transition hover:-translate-y-1 hover:!bg-[#F6B73C] hover:!shadow-[5px_6px_0_#33211D,0_0_28px_-14px_rgba(246,183,60,0.82)] active:translate-x-1 active:translate-y-1 active:!shadow-[1px_1px_0_#33211D] dark:!border-[#0B080D] dark:!bg-[#241B2F] dark:!text-[#31D7C6] dark:!shadow-[3px_3px_0_#0B080D] dark:hover:!bg-[#4E2A84] dark:hover:!shadow-[5px_6px_0_#0B080D,0_0_28px_-14px_rgba(49,215,198,0.72)]"
      onClick={async () => {
        if (!roomUrl) return;
        await navigator.clipboard.writeText(roomUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
      {copied ? "Copied!" : "Copy Invite"}
    </Button>
  );
}
