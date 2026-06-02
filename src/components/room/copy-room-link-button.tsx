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
      className="min-h-11 px-4"
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
