import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Copy, Settings } from "lucide-react";
import { getHostDeleteCookieName, getRoom } from "@/server/room-service";
import { startRoundAction } from "@/server/actions/room-actions";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SettingsForm } from "@/components/room/settings-form";
import { PlayerRoster } from "@/components/room/player-roster";
import { DeleteRoomButton } from "@/components/room/delete-room-button";
import { RoomSync } from "@/components/realtime/room-sync";
import { formatRoomCode } from "@/lib/game/room-code";
import type { Player, WordPair } from "@/lib/game/types";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ player?: string; message?: string; exited?: string; round?: string }>;
};

export default async function RoomPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { player, message, exited } = await searchParams;
  const room = await getRoom(code);
  const cookieStore = await cookies();

  if (!room) notFound();

  if (player) {
    const playerExists = room.players.some((p) => p.id === player);
    if (!playerExists) {
      redirect("/?message=removed");
    }
  }

  const isHost = player ? room.hostPlayerId === player : true;
  const hasHostDeleteToken =
    cookieStore.get(getHostDeleteCookieName(room.code))?.value === room.hostDeleteToken;
  const deleteRequesterPlayerId = player && room.hostPlayerId === player && hasHostDeleteToken ? player : null;
  const players = room.players.map((roomPlayer) => ({
    id: roomPlayer.id,
    name: roomPlayer.name,
    isHost: roomPlayer.isHost,
    status: roomPlayer.status
  })) satisfies Player[];

  const wordPairs = room.wordPairs.map((pair) => ({
    id: pair.id,
    normalWord: pair.normalWord,
    imposterWord: pair.imposterWord,
    position: pair.position
  })) satisfies WordPair[];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:px-8">
      <RoomSync roomCode={room.code} playerId={player} broadcastOnMount={true} />

      {message && (
        <div className="mb-6 rounded-2xl bg-[var(--sage-light)] border border-[var(--sage-solid)]/10 px-5 py-3.5 text-center text-sm font-semibold text-[var(--sage-solid)] animate-in fade-in slide-in-from-top-2 duration-300">
          {message === "completed" && "Game completed. Returning to lobby."}
          {message === "ended_by_host" && "Host ended the game."}
          {message === "exited" && "You returned to the lobby."}
        </div>
      )}

      {room.phase !== "LOBBY" && exited === "true" && (
        <div className="mb-6 rounded-2xl bg-[var(--amber-light)] border border-[var(--amber-solid)]/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <p className="font-semibold text-[var(--amber-solid)]">Game In Progress</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">The session is still active. You can rejoin the current round.</p>
          </div>
          <a
            href={`/game/${room.code}?player=${player}`}
            className="rounded-xl bg-[var(--amber-solid)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--amber-solid)]/90 transition shadow-[var(--shadow-soft)] cursor-pointer"
          >
            Rejoin Game
          </a>
        </div>
      )}

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Lobby Code</p>
          <h1 className="display-font text-4xl text-[var(--text-main)]">{formatRoomCode(room.code)}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="min-h-10 px-4">
            <Copy size={16} className="mr-2" />
            Copy Link
          </Button>
          <Button variant="ghost" className="min-h-10 px-3" aria-label="Settings">
            <Settings size={18} />
          </Button>
        </div>
      </header>

      {isHost ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Panel className="p-6 sm:p-8">
              <p className="mb-8 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                Game Configuration
              </p>
              <SettingsForm
                roomCode={room.code}
                mode={room.mode}
                totalPlayers={room.totalPlayers}
                imposterCount={room.imposterCount}
                wordPairs={wordPairs}
              />
              {deleteRequesterPlayerId ? (
                <div className="mt-8 border-t border-[var(--border-cozy)] pt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--clay-solid)]">
                    Danger Zone
                  </p>
                  <DeleteRoomButton roomCode={room.code} requesterPlayerId={deleteRequesterPlayerId} />
                </div>
              ) : null}
            </Panel>
            <div className="space-y-4">
              <PlayerRoster players={players} isHostViewer={true} roomCode={room.code} />
              <Panel className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                  Fair Shuffle
                </p>
                <p className="mt-2 font-mono text-sm text-[var(--sage-solid)]">
                  {room.shuffleSeedHash ?? "Seed appears when words are dealt."}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Shuffles are generated using secure random seeds, ensuring zero visible patterns across rounds.
                </p>
              </Panel>
            </div>
          </div>

          <form action={startRoundAction.bind(null, room.code)} className="sticky bottom-0 mt-6 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent py-4">
            <Button type="submit" className="w-full text-base">
              Deal Words & Start
            </Button>
          </form>
        </>
      ) : (
        <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
          <h1 className="display-font text-4xl">Waiting in the Lobby</h1>
          <p className="mt-3 text-[var(--text-muted)]">The host is preparing the deck of cards.</p>
          <div className="mt-8 w-full">
            <PlayerRoster players={players} isHostViewer={false} roomCode={room.code} />
          </div>
          <p className="mt-6 rounded-2xl bg-[var(--sage-light)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-[var(--sage-solid)]">
            {room.mode === "OFFLINE" ? "Offline mode" : "Online mode"}
          </p>
        </section>
      )}
    </main>
  );
}
