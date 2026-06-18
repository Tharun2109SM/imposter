import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Antenna, BadgeCheck, CircleDot, Radio, Signal, SlidersHorizontal, UsersRound } from "lucide-react";
import { canDeleteRoomFromBrowser, getHostDeleteCookieName, getRoom } from "@/server/room-service";
import { startRoundAction } from "@/server/actions/room-actions";
import { SettingsForm } from "@/components/room/settings-form";
import { PlayerRoster } from "@/components/room/player-roster";
import { DeleteRoomButton } from "@/components/room/delete-room-button";
import { CopyRoomLinkButton } from "@/components/room/copy-room-link-button";
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
  const canDeleteRoom = await canDeleteRoomFromBrowser(
    room.code,
    player,
    cookieStore.get(getHostDeleteCookieName(room.code))?.value
  );
  const deleteRequesterPlayerId = player && canDeleteRoom ? player : null;
  const players = room.players.map((roomPlayer) => ({
    id: roomPlayer.id,
    name: roomPlayer.name,
    isHost: roomPlayer.isHost,
    status: roomPlayer.status
  })) satisfies Player[];
  const connectedPlayers = players.filter((roomPlayer) => roomPlayer.status === "CONNECTED");
  const connectedViewers = connectedPlayers.filter((roomPlayer) => !roomPlayer.isHost);
  const hostPlayer = players.find((roomPlayer) => roomPlayer.isHost);
  const broadcastStatus = room.phase === "LOBBY" ? (isHost ? "LIVE" : "WAITING FOR HOST") : "ON AIR";
  const roomModeLabel = room.mode === "OFFLINE" ? "Studio Room" : "Online Signal";
  const capacity = room.totalPlayers;

  const wordPairs = room.wordPairs.map((pair) => ({
    id: pair.id,
    normalWord: pair.normalWord,
    imposterWord: pair.imposterWord,
    position: pair.position
  })) satisfies WordPair[];

  return (
    <main className="broadcast-lobby page-enter min-h-screen w-full overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col">
      <RoomSync roomCode={room.code} playerId={player} broadcastOnMount={true} />

      {message && (
        <div className="mb-4 rounded-2xl border-2 border-[#33211D] bg-[#F6B73C] px-5 py-3 text-center text-sm font-black text-[#33211D] shadow-[4px_4px_0_#33211D] animate-in fade-in slide-in-from-top-2 duration-300">
          {message === "completed" && "Game completed. Returning to lobby."}
          {message === "ended_by_host" && "Host ended the game."}
          {message === "exited" && "You returned to the lobby."}
        </div>
      )}

      {room.phase !== "LOBBY" && exited === "true" && (
        <div className="mb-4 flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-[#33211D] bg-[#FFF3DC] p-5 shadow-[5px_5px_0_#33211D] animate-in fade-in slide-in-from-top-2 duration-300 sm:flex-row">
          <div>
            <p className="font-black uppercase tracking-[0.08em] text-[#B94F37]">Broadcast In Progress</p>
            <p className="mt-1 text-sm font-bold text-[#775348]">The signal is already live. You can rejoin the current round.</p>
          </div>
          <a
            href={`/game/${room.code}?player=${player}`}
            className="broadcast-button rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-[0.08em] transition cursor-pointer"
          >
            Rejoin Signal
          </a>
        </div>
      )}

      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B94F37] dark:text-[#FF9B42]">Imposter Broadcast Station</p>
          <h1 className="display-font text-4xl leading-none text-[#33211D] drop-shadow-[3px_3px_0_rgba(246,183,60,0.55)] dark:text-[#F7EAD8] dark:drop-shadow-[3px_3px_0_#0B080D] sm:text-5xl">
            Channel 84
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#33211D] bg-[#E95843] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#FFF3DC] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
            <span className="broadcast-rec size-2.5 rounded-full bg-[#FFF3DC] dark:bg-[#161218]" />
            Live
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#33211D] bg-[#FFF3DC] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#233A5A] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[3px_3px_0_#0B080D]">
            <Signal size={15} />
            Signal Stable
          </div>
          <CopyRoomLinkButton roomCode={room.code} />
        </div>
      </header>

      <section className="grid flex-1 items-start gap-4 lg:grid-cols-[0.82fr_1.55fr_0.9fr]">
        <aside className="equipment-panel rounded-[1.7rem] p-4 lg:sticky lg:top-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#FF9B42]">Broadcast Console</p>
              <h2 className="display-font mt-1 text-3xl leading-none">Signal Bay</h2>
            </div>
            <Radio className="text-[#233A5A] dark:text-[#31D7C6]" size={28} />
          </div>
          <div className="space-y-3">
            {[
              ["Signal Strength", "Strong"],
              ["Transmission", "Stable"],
              ["Connection", roomModeLabel],
              ["Broadcaster", hostPlayer?.name ?? "Host"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8] p-3 shadow-[3px_3px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#775348] dark:text-[#F7EAD8]/60">{label}</p>
                <p className="mt-1 font-black text-[#233A5A] dark:text-[#31D7C6]">{value}</p>
              </div>
            ))}
            <div className="rounded-2xl border-2 border-[#33211D] bg-[linear-gradient(135deg,#F6B73C,#F67A3C)] p-3 shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#4E2A84,#241B2F)] dark:shadow-[3px_3px_0_#0B080D]">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
                <Antenna size={15} />
                Signal Connected
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <section className="broadcast-panel rounded-[2rem] p-4 sm:p-5">
            <div className="crt-shell rounded-[2.1rem] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3 px-1 text-[#F8E9D2]">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em]">
                  <span className="broadcast-rec size-3 rounded-full bg-[#E95843]" />
                  Rec
                </div>
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.12em]">
                  <span>Channel 84</span>
                  <span className="hidden sm:inline">T-00:84</span>
                  <Signal size={16} />
                </div>
              </div>
              <div className={`crt-screen min-h-[22rem] p-5 sm:min-h-[25rem] sm:p-7 ${room.phase !== "LOBBY" ? "crt-starting" : ""}`}>
                <div className="relative z-10 flex h-full min-h-[19rem] flex-col justify-between text-[#F7EAD8]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#F7EAD8]/24 bg-[#0B080D]/30 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em]">
                      <CircleDot className="broadcast-rec text-[#E95843]" size={14} />
                      {broadcastStatus}
                    </div>
                    <div className="rounded-full border border-[#F7EAD8]/24 bg-[#0B080D]/30 px-3 py-1.5 font-mono text-[0.68rem] font-black uppercase tracking-[0.12em]">
                      {roomModeLabel}
                    </div>
                  </div>

                  <div className="py-6 text-center">
                    <p className="crt-readout text-xs font-black uppercase tracking-[0.28em] text-[#FFCF7A]">Room Code</p>
                    <p className="crt-readout display-font mx-auto mt-2 max-w-full whitespace-nowrap text-center text-[clamp(2.85rem,7.6vw,6.2rem)] leading-none tracking-[-0.015em]">
                      {formatRoomCode(room.code)}
                    </p>
                    <div className="mx-auto mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#F7EAD8]/22 bg-[#0B080D]/34 p-4 shadow-[inset_0_0_24px_rgba(0,0,0,0.28)]">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#F7EAD8]/62">Players Connected</p>
                        <p className="crt-readout mt-1 font-mono text-4xl font-black">{connectedViewers.length} / {capacity}</p>
                      </div>
                      <div className="rounded-2xl border border-[#F7EAD8]/22 bg-[#0B080D]/34 p-4 shadow-[inset_0_0_24px_rgba(0,0,0,0.28)]">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#F7EAD8]/62">Status</p>
                        <p className="crt-readout mt-2 text-2xl font-black uppercase tracking-[0.12em]">{broadcastStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-bold text-[#F7EAD8]/72">
                      {isHost ? "You are broadcasting. Tune the room, then start the signal." : "Host preparing game... stay tuned for the channel switch."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((light) => (
                  <span
                    key={light}
                    className={`h-3 rounded-full border border-[#0B080D] shadow-[1px_1px_0_#0B080D] ${
                      light < Math.max(1, Math.min(5, connectedViewers.length + 1))
                        ? "bg-[#31D7C6]"
                        : "bg-[#F7EAD8]/24"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {isHost ? (
            <section className="equipment-panel rounded-[1.7rem] p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#FF9B42]">Broadcast Controls</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <form action={startRoundAction.bind(null, room.code)} className="sm:col-span-1">
                  <button type="submit" className="broadcast-button min-h-14 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.1em] transition">
                    Start Broadcast
                  </button>
                </form>
                {deleteRequesterPlayerId ? (
                  <DeleteRoomButton
                    roomCode={room.code}
                    requesterPlayerId={deleteRequesterPlayerId}
                    label="End Transmission"
                    className="broadcast-danger min-h-14 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.1em] transition"
                  />
                ) : null}
              </div>
              <details className="mt-4 rounded-[1.5rem] border-2 border-[#33211D] bg-[#FFF6E8] p-4 shadow-[4px_4px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[4px_4px_0_#0B080D]">
                <summary className="broadcast-button flex min-h-14 cursor-pointer list-none items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.1em] transition">
                  <SlidersHorizontal size={16} />
                  Room Settings
                </summary>
                <div className="mt-5">
                  <SettingsForm
                    roomCode={room.code}
                    mode={room.mode}
                    totalPlayers={room.totalPlayers}
                    imposterCount={room.imposterCount}
                    wordPairs={wordPairs}
                  />
                </div>
              </details>
            </section>
          ) : (
            <section className="equipment-panel rounded-[1.7rem] p-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#FF9B42]">Viewer Console</p>
              <p className="mt-2 text-sm font-bold text-[#775348] dark:text-[#F7EAD8]/70">
                Your receiver is locked to Channel 84. The host will switch the signal when the round begins.
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4">
          <div className="equipment-panel rounded-[1.7rem] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#FF9B42]">Players</p>
                <h2 className="display-font mt-1 text-3xl leading-none">Viewer IDs</h2>
              </div>
              <UsersRound className="text-[#233A5A] dark:text-[#31D7C6]" size={28} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8] p-3 shadow-[3px_3px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#775348] dark:text-[#F7EAD8]/60">Ready</p>
                <p className="font-mono text-2xl font-black text-[#233A5A] dark:text-[#31D7C6]">{connectedViewers.length}</p>
              </div>
              <div className="rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8] p-3 shadow-[3px_3px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#775348] dark:text-[#F7EAD8]/60">Host</p>
                <p className="truncate text-sm font-black text-[#233A5A] dark:text-[#31D7C6]">{hostPlayer?.name ?? "Live"}</p>
              </div>
            </div>
          </div>
          <PlayerRoster players={players} isHostViewer={isHost} roomCode={room.code} />
          <div className="equipment-panel rounded-[1.7rem] p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#B94F37] dark:text-[#FF9B42]">
              <BadgeCheck size={16} />
              Fair Shuffle
            </div>
            <p className="mt-2 break-all font-mono text-xs font-bold text-[#233A5A] dark:text-[#31D7C6]">
              {room.shuffleSeedHash ?? "Seed appears when words are dealt."}
            </p>
          </div>
        </aside>
      </section>
      </div>
    </main>
  );
}
