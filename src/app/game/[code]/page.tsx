import Link from "next/link";
import type { CSSProperties } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { advancePhaseAction, startRoundAction, submitVoteAction } from "@/server/actions/room-actions";
import { canDeleteRoomFromBrowser, getGameRoom, getHostDeleteCookieName } from "@/server/room-service";
import { Button } from "@/components/ui/button";
import { RevealCard } from "@/components/game/reveal-card";
import { ClueForm } from "@/components/game/clue-form";
import { RoomSync } from "@/components/realtime/room-sync";
import { formatRoomCode } from "@/lib/game/room-code";
import { ExitToLobbyButton, CompleteGameButton } from "@/components/game/game-navigation";
import { DeleteRoomButton } from "@/components/room/delete-room-button";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ player?: string }>;
};

export default async function GamePage({ params, searchParams }: Props) {
  const { code } = await params;
  const { player } = await searchParams;
  const room = await getGameRoom(code, player);
  const cookieStore = await cookies();

  if (!room || !room.currentRound) notFound();
  const currentRound = room.currentRound;

  if (player) {
    const playerExists = room.players.some((p) => p.id === player);
    if (!playerExists) {
      redirect("/?message=removed");
    }
  }

  const hostPlayerId = room.hostPlayerId ?? room.players.find((roomPlayer) => roomPlayer.isHost)?.id;
  const currentPlayerId = player ?? hostPlayerId ?? room.players[0]?.id;
  const isHost = currentPlayerId === hostPlayerId || !player;
  const canDeleteRoom = await canDeleteRoomFromBrowser(
    room.code,
    player,
    cookieStore.get(getHostDeleteCookieName(room.code))?.value
  );
  const deleteRequesterPlayerId = player && canDeleteRoom ? player : null;
  const currentAssignment =
    currentRound.assignments.find((assignment) => assignment.playerId === currentPlayerId) ??
    currentRound.assignments[0];
  const clueByPlayer = new Map(currentRound.clues.map((clue) => [clue.playerId, clue.value]));
  const nonHostPlayers = room.players.filter((roomPlayer) => !roomPlayer.isHost);
  const submittedClueCount = nonHostPlayers.filter((roomPlayer) => clueByPlayer.has(roomPlayer.id)).length;
  const currentPlayerClue = clueByPlayer.get(currentPlayerId);
  const imposters = currentRound.assignments.filter((assignment) => assignment.isImposter);
  const imposterIds = new Set(imposters.map((assignment) => assignment.playerId));
  const playerById = new Map(room.players.map((roomPlayer) => [roomPlayer.id, roomPlayer]));
  const voteByPlayer = new Map(currentRound.votes.map((vote) => [vote.voterId, vote]));
  const currentPlayerVote = voteByPlayer.get(currentPlayerId);
  const currentPlayerVoteLabel =
    currentPlayerVote?.kind === "SKIP"
      ? "Skip"
      : playerById.get(currentPlayerVote?.targetPlayerId ?? "")?.name ?? "";
  const votesReceivedCount = currentRound.votes.length;
  const voteTally = [
    ...nonHostPlayers.map((roomPlayer) => ({
      id: roomPlayer.id,
      label: roomPlayer.name,
      count: currentRound.votes.filter((vote) => vote.targetPlayerId === roomPlayer.id).length
    })),
    {
      id: "skip",
      label: "Skip",
      count: currentRound.votes.filter((vote) => vote.kind === "SKIP").length
    }
  ].filter((entry) => entry.count > 0);
  const maxVoteCount = Math.max(1, ...voteTally.map((entry) => entry.count));
  const voteHistory = nonHostPlayers.map((roomPlayer) => {
    const vote = voteByPlayer.get(roomPlayer.id);
    return {
      player: roomPlayer,
      targetName:
        vote?.kind === "SKIP"
          ? "Skip"
          : playerById.get(vote?.targetPlayerId ?? "")?.name ?? "No vote",
      isCorrect: Boolean(vote?.targetPlayerId && imposterIds.has(vote.targetPlayerId))
    };
  });
  const isFinalRound = currentRound.number >= room.wordPairs.length;
  const shellClass =
    room.phase === "REVEAL"
      ? "reveal-boot-bg"
      : room.phase === "OFFLINE_DISCUSSION" ||
          room.phase === "CLUE_SUBMISSION" ||
          room.phase === "CLUE_REVIEW" ||
          room.phase === "VOTING" ||
          room.phase === "RESULTS" ||
          room.phase === "ENDED"
        ? "broadcast-lobby"
        : "ambient-bg party-shell";

  return (
    <main className={`${shellClass} page-enter min-h-screen`}>
      <RoomSync roomCode={room.code} playerId={currentPlayerId} broadcastOnMount={isHost} />
      {room.phase === "REVEAL" ? (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-6 text-center text-[#33211D] dark:text-[#F7EAD8]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px),repeating-linear-gradient(45deg,rgba(51,33,29,0.045)_0_1px,transparent_1px_7px)] [background-size:8px_8px,14px_14px] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px),repeating-linear-gradient(45deg,rgba(247,234,216,0.045)_0_1px,transparent_1px_7px)]" />
          {isHost ? (
            <div className="relative z-10 w-full max-w-3xl rounded-[2rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F2D1A8)] p-5 shadow-[8px_9px_0_#233A5A,0_44px_120px_-56px_rgba(51,33,29,0.82)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:shadow-[8px_9px_0_#0B080D,14px_15px_0_rgba(255,79,163,0.18)] sm:p-7">
              <div className="rounded-[1.7rem] border-[3px] border-[#33211D] bg-[#233A5A] p-5 text-[#F7EAD8] shadow-[inset_0_0_42px_rgba(0,0,0,0.4)] dark:border-[#0B080D] dark:bg-[#0B080D]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-[#F7EAD8]/24 bg-[#0B080D]/30 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em]">
                    Cartridge Boot
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#F7EAD8]/24 bg-[#0B080D]/30 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em]">
                    <span className="broadcast-rec size-2.5 rounded-full bg-[#31D7C6]" />
                    Ready
                  </span>
                </div>
                <div className="handheld-screen mx-auto min-h-[20rem] max-w-2xl rounded-[1.5rem] p-6">
                  <div className="relative z-10 flex min-h-[16.5rem] flex-col items-center justify-center">
                    <p className="lcd-text font-mono text-sm font-black uppercase tracking-[0.18em]">Initializing Cartridge...</p>
                    <h1 className="lcd-text display-font mt-5 text-[clamp(3rem,9vw,6rem)] leading-none">
                      Round {room.currentRound.number}
                    </h1>
                    <div className="mt-7 w-full max-w-md space-y-3 text-left font-mono text-sm font-black uppercase tracking-[0.1em]">
                      {["Preparing round...", "Assigning secret words...", "Loading players...", "Ready."].map((line, index) => (
                        <div key={line} className="flex items-center gap-3">
                          <span className={`size-3 rounded-sm border border-[#223A2C] ${index < 3 ? "bg-[#223A2C]" : "broadcast-rec bg-[#31D7C6]"}`} />
                          <span className="lcd-text">{line}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pixel-loader mt-7 h-4 w-44 rounded-sm bg-[repeating-linear-gradient(90deg,#223A2C_0_0.65rem,transparent_0.65rem_1rem)] opacity-75" />
                  </div>
                </div>
              </div>
              <form action={advancePhaseAction.bind(null, room.code)} className="mt-8">
                <Button type="submit" className="min-h-14 rounded-2xl border-2 border-[#33211D] bg-[linear-gradient(135deg,#F6B73C,#F67A3C)] px-7 text-sm font-black uppercase tracking-[0.1em] text-[#33211D] shadow-[5px_5px_0_#33211D] hover:-translate-y-1 hover:shadow-[7px_8px_0_#33211D,0_0_34px_-14px_rgba(246,183,60,0.82)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#31D7C6,#FF9B42)] dark:text-[#161218] dark:shadow-[5px_5px_0_#0B080D]">
                  Everyone Has Seen Their Word
                </Button>
              </form>
            </div>
          ) : (
            <div className="relative z-10 grid w-full place-items-center">
              <p className="mb-5 h-10 rounded-full border-2 border-[#33211D] bg-[#FFF6E8] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#233A5A] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[3px_3px_0_#0B080D]">
                Shield the screen. Secret cartridge loaded.
              </p>
              <RevealCard word={currentAssignment.word} isImposter={currentAssignment.isImposter} />
              <p className="mt-5 flex h-12 items-center rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8] px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#775348] shadow-[3px_3px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#161218] dark:text-[#F7EAD8]/68 dark:shadow-[3px_3px_0_#0B080D]">
                Waiting for other players
                <span className="pixel-loader ml-2 inline-block w-10 overflow-hidden text-left">...</span>
              </p>
            </div>
          )}

          {room.mode === "OFFLINE" && (
            <div className="relative z-10 mt-5 flex min-h-12 flex-wrap items-start justify-center gap-2">
              {room.players.filter(p => !p.isHost).map((p) => (
                <Link
                  key={p.id}
                  href={`/game/${room.code}?player=${p.id}`}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_rgba(51,33,29,0.26)] transition hover:-translate-y-0.5 dark:shadow-[3px_3px_0_#0B080D] ${
                    currentPlayerId === p.id
                      ? "border-[#33211D] bg-[#F6B73C] text-[#33211D] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:text-[#161218]"
                      : "border-[#33211D] bg-[#FFF6E8] text-[#233A5A] hover:bg-white dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#F7EAD8]"
                  }`}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {room.phase === "OFFLINE_DISCUSSION" ? (
        <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-7 text-center text-[#33211D] dark:text-[#F7EAD8] sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem)] [background-size:8px_8px,5rem_5rem,5rem_5rem] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem)]" />
          <header className="relative z-10 flex items-center justify-center gap-3 text-left sm:justify-between">
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              <span className="rounded-full border-2 border-[#33211D] bg-[#FFF6E8] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#233A5A] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[3px_3px_0_#0B080D]">
                Room {formatRoomCode(room.code)}
              </span>
              <span className="rounded-full border-2 border-[#33211D] bg-[#F6B73C] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#33211D] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[#FF9B42] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                Round {room.currentRound.number}
              </span>
            </div>
          </header>
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-10">
            <div className="radio-console soft-enter w-full max-w-4xl p-5 sm:p-8">
              <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                <div className="rounded-[1.7rem] border-[3px] border-[#33211D] bg-[#F8E9D2] p-5 shadow-[inset_0_0_28px_rgba(51,33,29,0.18),5px_5px_0_rgba(51,33,29,0.38)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[inset_0_0_34px_rgba(49,215,198,0.12),5px_5px_0_#0B080D]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <span className="rounded-full border-2 border-[#33211D] bg-[#F6B73C] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.3)] dark:border-[#0B080D] dark:bg-[#FF9B42] dark:text-[#161218] dark:shadow-[2px_2px_0_#0B080D]">
                      Imposter FM
                    </span>
                    <span className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#31D7C6]">
                      <span className="broadcast-rec size-3 rounded-full bg-[#E95843] dark:bg-[#31D7C6]" />
                      Discussion Live
                    </span>
                  </div>
                  <h1 className="font-mono text-[clamp(4.5rem,17vw,8.5rem)] font-black leading-none tabular-nums text-[#233A5A] drop-shadow-[5px_5px_0_rgba(246,183,60,0.82)] dark:text-[#F7EAD8] dark:drop-shadow-[5px_5px_0_rgba(255,79,163,0.45)]">
                    04:20
                  </h1>
                  <div className="radio-dial relative mt-6 h-12 overflow-hidden rounded-2xl shadow-[inset_0_2px_0_rgba(255,255,255,0.55)]">
                    <span className="radio-needle absolute left-1/2 top-0 h-full w-1.5 rounded-full bg-[#E95843] shadow-[0_0_16px_rgba(233,88,67,0.55)] dark:bg-[#31D7C6] dark:shadow-[0_0_18px_rgba(49,215,198,0.55)]" />
                  </div>
                  <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#775348] dark:text-[#F7EAD8]/72">
                    Talk it out. Someone is bluffing.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border-[3px] border-[#33211D] bg-[#33211D] p-5 shadow-[5px_5px_0_rgba(51,33,29,0.36)] dark:border-[#0B080D] dark:bg-[#0B080D] dark:shadow-[5px_5px_0_#0B080D]">
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 36 }).map((_, index) => (
                        <span key={index} className="aspect-square rounded-full bg-[#F8E9D2]/38 dark:bg-[#31D7C6]/30" />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["ON AIR", "TUNED", "LIVE"].map((label, index) => (
                      <span key={label} className={`rounded-xl border-2 border-[#33211D] px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_rgba(51,33,29,0.3)] dark:border-[#0B080D] dark:shadow-[3px_3px_0_#0B080D] ${index === 1 ? "bg-[#F6B73C] text-[#33211D] dark:bg-[#31D7C6] dark:text-[#161218]" : "bg-[#FFF6E8] text-[#775348] dark:bg-[#241B2F] dark:text-[#F7EAD8]"}`}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {isHost ? (
              <div className="soft-enter mt-8 w-full max-w-2xl rounded-[1.75rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#FFE2C0)] p-5 text-left shadow-[6px_7px_0_#33211D] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:shadow-[6px_7px_0_#0B080D]">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[1.1rem] border-2 border-[#33211D] bg-[#F6B73C] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#33211D] shadow-[3px_3px_0_rgba(51,33,29,0.34)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(51,33,29,0.38)] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                    <span>Secret Word</span>
                    <span className="rounded-full border-2 border-[#33211D] bg-[#FFF6E8] px-3 py-1 text-[0.68rem] text-[#233A5A] dark:border-[#0B080D] dark:bg-[#161218] dark:text-[#F7EAD8]">
                      Click to Reveal
                    </span>
                  </summary>
                  <div className="mt-5 grid gap-3 text-sm font-bold text-[#775348] dark:text-[#F7EAD8]/78 sm:grid-cols-3">
                    <div className="rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8] p-4 shadow-[3px_3px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:shadow-[3px_3px_0_#0B080D]">
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#B94F37] dark:text-[#FF9B42]">Normal Word</p>
                      <strong className="display-font mt-2 block text-3xl text-[#33211D] dark:text-[#F7EAD8]">{room.currentRound.wordPair.normalWord}</strong>
                    </div>
                    <div className="rounded-2xl border-2 border-[#33211D] bg-[#F8E9D2] p-4 shadow-[3px_3px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:shadow-[3px_3px_0_#0B080D]">
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#B94F37] dark:text-[#FF9B42]">Imposter Word</p>
                      <strong className="display-font mt-2 block text-3xl text-[#33211D] dark:text-[#F7EAD8]">{room.currentRound.wordPair.imposterWord}</strong>
                    </div>
                    <div className="rounded-2xl border-2 border-[#33211D] bg-[#FFE2C0] p-4 shadow-[3px_3px_0_rgba(51,33,29,0.22)] dark:border-[#0B080D] dark:bg-[#4E2A84] dark:shadow-[3px_3px_0_#0B080D]">
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#B94F37] dark:text-[#31D7C6]">Imposters</p>
                      <strong className="mt-2 block text-base text-[#33211D] dark:text-[#F7EAD8]">
                        {imposters.map((assignment) => assignment.player.name).join(", ")}
                      </strong>
                    </div>
                  </div>
                </details>
              </div>
            ) : null}
          </div>
          {isHost ? (
            <form action={advancePhaseAction.bind(null, room.code)} className="relative z-10 mx-auto w-full max-w-2xl pb-2">
              <Button type="submit" className="broadcast-button min-h-14 w-full rounded-2xl px-7 text-sm uppercase tracking-[0.14em]">
                End Round
              </Button>
            </form>
          ) : null}
        </section>
      ) : null}

      {room.phase === "CLUE_SUBMISSION" ? (
        <section className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-10 text-[#33211D] dark:text-[#F7EAD8] sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem)] [background-size:8px_8px,5rem_5rem,5rem_5rem] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem)]" />
          {isHost ? (
            <div className="cork-board soft-enter relative z-10 mx-auto w-full rounded-[2rem] p-5 text-center sm:p-8">
              <div className="relative z-10">
                <div className="mx-auto mb-6 inline-flex rounded-[1.1rem] border-[3px] border-[#33211D] bg-[#FFF6E8] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#233A5A] shadow-[4px_4px_0_rgba(51,33,29,0.42)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[4px_4px_0_#0B080D]">
                  Detective Cork Board
                </div>
                <h1 className="display-font text-[clamp(3.4rem,8vw,6.8rem)] leading-none text-[#FFF6E8] drop-shadow-[5px_5px_0_rgba(51,33,29,0.78)] dark:text-[#F7EAD8]">Waiting for clues</h1>
                <p className="mx-auto mt-4 max-w-xl rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8]/92 px-5 py-3 font-bold leading-7 text-[#775348] shadow-[4px_4px_0_rgba(51,33,29,0.34)] dark:border-[#0B080D] dark:bg-[#161218]/86 dark:text-[#F7EAD8]/78 dark:shadow-[4px_4px_0_#0B080D]">
                  Polaroids develop as players submit their clues.
                </p>
              </div>
              <div className="relative z-10 mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
                {nonHostPlayers.map((p, index) => {
                  const hasSubmitted = clueByPlayer.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className="polaroid-card min-h-64 px-5 pb-8 pt-36"
                      style={{ "--polaroid-rotate": `${[-2, 2.5, -1, 1.5, -2.5, 1][index % 6]}deg` } as CSSProperties}
                    >
                      {hasSubmitted ? <span className="camera-flash pointer-events-none absolute inset-0 z-20 rounded-[0.9rem] bg-white" /> : null}
                      <p className="relative z-10 text-sm font-black uppercase tracking-[0.12em] text-[#775348] dark:text-[#F7EAD8]/76">{p.name}</p>
                      <p className="relative z-10 mt-3 break-words display-font text-[clamp(2.1rem,6vw,3.8rem)] italic leading-none text-[#33211D] dark:text-[#F7EAD8]">
                        {hasSubmitted ? `"${clueByPlayer.get(p.id)}"` : "Developing..."}
                      </p>
                      <span className={`relative z-10 mt-5 inline-flex rounded-full border-2 border-[#33211D] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] dark:border-[#0B080D] ${hasSubmitted ? "bg-[#69733F] text-[#FFF6E8] dark:bg-[#31D7C6] dark:text-[#161218]" : "bg-[#F6B73C] text-[#33211D] dark:bg-[#FF9B42] dark:text-[#161218]"}`}>
                        {hasSubmitted ? "Developed" : "Blank Photo"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <form action={advancePhaseAction.bind(null, room.code)} className="relative z-10 mt-10">
                <Button type="submit" className="broadcast-button min-h-14 w-full rounded-2xl px-7 text-sm uppercase tracking-[0.14em]">Review Clues</Button>
              </form>
            </div>
          ) : currentPlayerClue ? (
            <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
              <div className="cork-board soft-enter rounded-[2rem] p-6 sm:p-9">
                <div className="relative z-10 mx-auto max-w-xl">
                  <p className="mx-auto inline-flex rounded-[1.1rem] border-[3px] border-[#33211D] bg-[#FFF6E8] px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#233A5A] shadow-[4px_4px_0_rgba(51,33,29,0.42)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[4px_4px_0_#0B080D]">
                    Your clue has been developed
                  </p>
                  <div className="polaroid-card mx-auto mt-8 min-h-72 max-w-sm px-6 pb-10 pt-40">
                    <span className="camera-flash pointer-events-none absolute inset-0 z-20 rounded-[0.9rem] bg-white" />
                    <p className="relative z-10 text-sm font-black uppercase tracking-[0.12em] text-[#775348] dark:text-[#F7EAD8]/76">Your Clue</p>
                    <p className="relative z-10 mt-4 break-words display-font text-[clamp(2.6rem,9vw,4.8rem)] italic leading-none text-[#33211D] dark:text-[#F7EAD8]">
                      &quot;{currentPlayerClue}&quot;
                    </p>
                  </div>
                  <div className="mt-8 rounded-[1.3rem] border-[3px] border-[#33211D] bg-[#FFF6E8] px-5 py-4 shadow-[5px_5px_0_rgba(51,33,29,0.45)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[5px_5px_0_#0B080D]">
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-[#775348] dark:text-[#F7EAD8]/74">Waiting for everyone</p>
                    <p className="mt-2 font-mono text-2xl font-black text-[#233A5A] dark:text-[#31D7C6]">
                      {submittedClueCount} / {nonHostPlayers.length} players submitted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 w-full">
              <ClueForm roomCode={room.code} playerId={currentPlayerId} word={currentAssignment.word} />
            </div>
          )}
        </section>
      ) : null}

      {room.phase === "CLUE_REVIEW" ? (
        <section className="relative mx-auto min-h-screen max-w-6xl px-5 py-8 text-[#33211D] dark:text-[#F7EAD8] sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem)] [background-size:8px_8px,5rem_5rem,5rem_5rem] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem)]" />
          <div className="cork-board soft-enter relative z-10 rounded-[2rem] p-5 sm:p-8">
            <header className="relative z-10 mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="inline-flex rounded-[1rem] border-[3px] border-[#33211D] bg-[#FFF6E8] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#233A5A] shadow-[4px_4px_0_rgba(51,33,29,0.42)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[4px_4px_0_#0B080D]">The Clue Board</p>
                <h1 className="display-font mt-4 max-w-3xl text-[clamp(3.5rem,8vw,6.8rem)] leading-none text-[#FFF6E8] drop-shadow-[5px_5px_0_rgba(51,33,29,0.78)] dark:text-[#F7EAD8]">Read between the words.</h1>
              </div>
              <span className="inline-flex w-fit rounded-[1.1rem] border-[3px] border-[#33211D] bg-[#FFF6E8] px-5 py-3 font-mono text-xl font-black tabular-nums text-[#E95843] shadow-[4px_4px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#FF9B42] dark:shadow-[4px_4px_0_#0B080D]">02:40</span>
            </header>
            <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nonHostPlayers.map((roomPlayer, index) => {
                const clue = clueByPlayer.get(roomPlayer.id);
                return (
                  <div
                    key={roomPlayer.id}
                    className="polaroid-card min-h-64 px-5 pb-8 pt-36"
                    style={{ "--polaroid-rotate": `${[-2, 2.5, -1, 1.5, -2.5, 1][index % 6]}deg` } as CSSProperties}
                  >
                    {clue ? <span className="camera-flash pointer-events-none absolute inset-0 z-20 rounded-[0.9rem] bg-white" /> : null}
                    <span className="relative z-10 text-sm font-black uppercase tracking-[0.08em] text-[#775348] dark:text-[#F7EAD8]/72">{roomPlayer.name}</span>
                    <p className="relative z-10 mt-4 break-words display-font text-[clamp(2.4rem,6vw,4.4rem)] italic leading-none text-[#33211D] dark:text-[#F7EAD8]">
                      {clue ? `"${clue}"` : "Developing..."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          {isHost ? (
            <form action={advancePhaseAction.bind(null, room.code)} className="relative z-10 mt-8">
              <Button type="submit" className="broadcast-button min-h-14 w-full rounded-2xl px-7 text-sm uppercase tracking-[0.14em]">Open Voting</Button>
            </form>
          ) : null}
        </section>
      ) : null}

      {room.phase === "VOTING" ? (
        <section className="relative mx-auto min-h-screen max-w-6xl px-5 py-8 text-[#33211D] dark:text-[#F7EAD8] sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(51,33,29,0.035)_0_1px,transparent_1px_5rem)] [background-size:8px_8px,5rem_5rem,5rem_5rem] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px),repeating-linear-gradient(0deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem),repeating-linear-gradient(90deg,rgba(247,234,216,0.035)_0_1px,transparent_1px_5rem)]" />
          <header className="relative z-10 mb-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#233A5A] dark:text-[#31D7C6]">Cast Your Vote</p>
            <h1 className="display-font mt-2 max-w-5xl text-[clamp(3.3rem,8vw,6.6rem)] leading-none drop-shadow-[5px_5px_0_rgba(246,183,60,0.72)] dark:drop-shadow-[5px_5px_0_rgba(255,79,163,0.35)]">
              {isHost ? "Players are voting." : "Identify the Imposter, or choose to skip."}
            </h1>
          </header>
          {isHost ? (
            <div className="radio-console soft-enter relative z-10 mx-auto max-w-4xl p-5 sm:p-8">
              <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-center">
                <div className="rounded-[1.7rem] border-[3px] border-[#33211D] bg-[#F8E9D2] p-5 shadow-[inset_0_0_28px_rgba(51,33,29,0.18),5px_5px_0_rgba(51,33,29,0.38)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[inset_0_0_34px_rgba(49,215,198,0.12),5px_5px_0_#0B080D]">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full border-2 border-[#33211D] bg-[#F6B73C] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#33211D] shadow-[2px_2px_0_rgba(51,33,29,0.3)] dark:border-[#0B080D] dark:bg-[#FF9B42] dark:text-[#161218] dark:shadow-[2px_2px_0_#0B080D]">
                      Vote Radio
                    </span>
                    <span className="inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#31D7C6]">
                      <span className="broadcast-rec size-3 rounded-full bg-[#E95843] dark:bg-[#31D7C6]" />
                      Live Updates
                    </span>
                  </div>
                  <h2 className="display-font text-[clamp(3.4rem,8vw,5.8rem)] leading-none text-[#233A5A] drop-shadow-[4px_4px_0_rgba(246,183,60,0.72)] dark:text-[#F7EAD8] dark:drop-shadow-[4px_4px_0_rgba(255,79,163,0.4)]">
                    Collecting Votes
                  </h2>
                  <div className="radio-dial relative mt-6 h-12 overflow-hidden rounded-2xl shadow-[inset_0_2px_0_rgba(255,255,255,0.55)]">
                    <span className="radio-needle absolute left-1/2 top-0 h-full w-1.5 rounded-full bg-[#E95843] shadow-[0_0_16px_rgba(233,88,67,0.55)] dark:bg-[#31D7C6] dark:shadow-[0_0_18px_rgba(49,215,198,0.55)]" />
                  </div>
                  <p className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-[#775348] dark:text-[#F7EAD8]/72">
                    As host, monitor the broadcast.
                  </p>
                </div>
                <div className="grid gap-3 text-left">
                {nonHostPlayers.map((p) => {
                  const hasVoted = room.currentRound?.votes.some(v => v.voterId === p.id);
                  return (
                    <div
                      key={p.id}
                      className={`soft-enter flex items-center justify-between gap-4 rounded-[1.15rem] border-2 border-[#33211D] px-4 py-3.5 shadow-[4px_4px_0_rgba(51,33,29,0.42)] dark:border-[#0B080D] dark:shadow-[4px_4px_0_#0B080D] ${
                        hasVoted
                          ? "bg-[linear-gradient(135deg,#DDE7BE,#FFF6E8)] dark:bg-[linear-gradient(135deg,#31D7C6,#241B2F)]"
                          : "bg-[linear-gradient(135deg,#FFF6E8,#F8E9D2)] dark:bg-[linear-gradient(135deg,#241B2F,#161218)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#33211D] text-sm font-black uppercase shadow-[2px_2px_0_rgba(51,33,29,0.28)] dark:border-[#0B080D] dark:shadow-[2px_2px_0_#0B080D] ${hasVoted ? "bg-[#69733F] text-[#FFF6E8] dark:bg-[#31D7C6] dark:text-[#161218]" : "bg-[#F6B73C] text-[#33211D] dark:bg-[#FF9B42] dark:text-[#161218]"}`}>
                          {p.name.slice(0, 1)}
                        </span>
                        <span className="truncate text-base font-black">{p.name}</span>
                      </span>
                      <span className={`shrink-0 rounded-full border-2 border-[#33211D] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.1em] dark:border-[#0B080D] ${hasVoted ? "bg-[#233A5A] text-[#FFF6E8] dark:bg-[#161218] dark:text-[#31D7C6]" : "bg-[#FFF6E8] text-[#775348] dark:bg-[#161218] dark:text-[#F7EAD8]/70"}`}>
                        {hasVoted ? "Voted" : "Deciding..."}
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>
              <form action={advancePhaseAction.bind(null, room.code)} className="mt-8">
                <Button type="submit" className="broadcast-button min-h-14 w-full rounded-2xl px-7 text-sm uppercase tracking-[0.14em]">Reveal Results</Button>
              </form>
            </div>
          ) : (
            currentPlayerVote ? (
              <div className="radio-console soft-enter relative z-10 mx-auto max-w-4xl p-5 text-center sm:p-8">
                <div className="rounded-[1.7rem] border-[3px] border-[#33211D] bg-[#F8E9D2] p-6 shadow-[inset_0_0_28px_rgba(51,33,29,0.18),5px_5px_0_rgba(51,33,29,0.38)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[inset_0_0_34px_rgba(49,215,198,0.12),5px_5px_0_#0B080D] sm:p-8">
                  <p className="mx-auto inline-flex rounded-full border-2 border-[#33211D] bg-[#69733F] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FFF6E8] shadow-[3px_3px_0_rgba(51,33,29,0.32)] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                    Vote Submitted
                  </p>
                  <h2 className="display-font mx-auto mt-5 max-w-3xl text-[clamp(3.5rem,8vw,6.5rem)] leading-none text-[#233A5A] drop-shadow-[5px_5px_0_rgba(246,183,60,0.72)] dark:text-[#F7EAD8] dark:drop-shadow-[5px_5px_0_rgba(255,79,163,0.4)]">
                    Your vote is locked in.
                  </h2>
                  <div className="mx-auto mt-7 max-w-lg rounded-[1.35rem] border-[3px] border-[#33211D] bg-[#FFF6E8] p-5 shadow-[5px_5px_0_rgba(51,33,29,0.38)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:shadow-[5px_5px_0_#0B080D]">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#775348] dark:text-[#F7EAD8]/70">You voted for</p>
                    <p className="display-font mt-2 break-words text-[clamp(2.8rem,8vw,5rem)] leading-none text-[#33211D] dark:text-[#F7EAD8]">
                      {currentPlayerVoteLabel}
                    </p>
                  </div>
                  <div className="mx-auto mt-7 max-w-xl text-left">
                    <div className="mb-3 flex items-center justify-between gap-4 text-xs font-black uppercase tracking-[0.14em] text-[#775348] dark:text-[#F7EAD8]/72">
                      <span>Votes Received</span>
                      <span>
                        {votesReceivedCount} / {nonHostPlayers.length} Players
                      </span>
                    </div>
                    <div className="h-5 rounded-full border-2 border-[#33211D] bg-[#FFF6E8] p-1 shadow-[3px_3px_0_rgba(51,33,29,0.28)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:shadow-[3px_3px_0_#0B080D]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#F6B73C,#F67A3C,#69733F)] dark:bg-[linear-gradient(90deg,#31D7C6,#FF9B42,#FF4FA3)]"
                        style={{ width: `${Math.round((votesReceivedCount / Math.max(1, nonHostPlayers.length)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-6 text-sm font-black uppercase tracking-[0.14em] text-[#775348] dark:text-[#F7EAD8]/70">
                    Waiting for the remaining players...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative z-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {nonHostPlayers.map((roomPlayer) => (
                    <div
                      key={roomPlayer.id}
                      className="evidence-card soft-enter relative overflow-hidden rounded-[1.55rem] p-5 pt-14 transition hover:-translate-y-1 hover:rotate-[0.35deg] hover:shadow-[9px_10px_0_rgba(51,33,29,0.82)] dark:hover:shadow-[9px_10px_0_#0B080D]"
                    >
                      <span className="absolute left-5 top-3 rounded-full border-2 border-[#33211D] bg-[#F67A3C] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#33211D] dark:border-[#0B080D] dark:bg-[#FF9B42] dark:text-[#161218]">
                        Evidence File
                      </span>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-full border-2 border-[#33211D] bg-[#233A5A] text-lg font-black uppercase text-[#F7EAD8] shadow-[3px_3px_0_rgba(51,33,29,0.3)] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:text-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                          {roomPlayer.name.slice(0, 1)}
                        </span>
                        <h2 className="truncate text-xl font-black">{roomPlayer.name}</h2>
                      </div>
                      <div className="polaroid-card min-h-44 px-4 pb-5 pt-24" style={{ "--polaroid-rotate": "-1.5deg" } as CSSProperties}>
                        <p className="relative z-10 text-xs font-black uppercase tracking-[0.1em] text-[#775348] dark:text-[#F7EAD8]/72">Submitted Clue</p>
                        <p className="relative z-10 mt-2 break-words display-font text-[clamp(1.9rem,5vw,3.1rem)] italic leading-none text-[#33211D] dark:text-[#F7EAD8]">
                          &quot;{clueByPlayer.get(roomPlayer.id) ?? "No clue"}&quot;
                        </p>
                      </div>
                      <form action={submitVoteAction.bind(null, room.code, currentPlayerId, roomPlayer.id)}>
                        <Button type="submit" className="broadcast-button mt-5 min-h-12 w-full rounded-2xl px-5 text-xs uppercase tracking-[0.12em]">
                          Vote {roomPlayer.name}
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
                <form action={submitVoteAction.bind(null, room.code, currentPlayerId, undefined)} className="relative z-10 mt-8 flex justify-center">
                  <Button type="submit" variant="outline" className="min-h-14 w-full max-w-md rounded-2xl border-[3px] border-[#33211D] bg-[#FFF6E8] px-7 text-sm font-black uppercase tracking-[0.12em] text-[#33211D] shadow-[5px_5px_0_#33211D] transition hover:-translate-y-1 hover:bg-[#F8E9D2] hover:shadow-[7px_8px_0_#33211D] active:translate-y-0 active:shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#F7EAD8] dark:shadow-[5px_5px_0_#0B080D] dark:hover:bg-[#4E2A84]">
                    Skip Voting (Abstain)
                  </Button>
                </form>
              </>
            )
          )}
        </section>
      ) : null}
      {room.phase === "RESULTS" ? (
        <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-10 text-center text-[#33211D] dark:text-[#F7EAD8] sm:px-8">
          <div className="pointer-events-none absolute inset-0 confetti-dots opacity-55" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-multiply [background-image:radial-gradient(#33211D_0.75px,transparent_0.9px),repeating-linear-gradient(45deg,rgba(51,33,29,0.045)_0_1px,transparent_1px_7px)] [background-size:8px_8px,14px_14px] dark:mix-blend-screen dark:[background-image:radial-gradient(#F7EAD8_0.75px,transparent_0.9px),repeating-linear-gradient(45deg,rgba(247,234,216,0.045)_0_1px,transparent_1px_8px)]" />
          <div className="soft-enter relative z-10 rounded-[2rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F8E9D2_45%,#F2CFA9)] p-5 shadow-[10px_11px_0_#233A5A,16px_17px_0_rgba(185,79,55,0.18),0_52px_120px_-62px_rgba(51,33,29,0.86)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218_52%,#4E2A84)] dark:shadow-[10px_11px_0_#0B080D,16px_17px_0_rgba(255,79,163,0.18),0_0_70px_-38px_rgba(49,215,198,0.74)] sm:p-8">
            <div className="mx-auto mb-7 h-3 w-full max-w-2xl rounded-full border-2 border-[#33211D] bg-[repeating-linear-gradient(90deg,#233A5A_0_16%,#F6B73C_16%_32%,#F67A3C_32%_48%,#D9829B_48%_64%,#69733F_64%_80%)] shadow-[3px_3px_0_rgba(51,33,29,0.28)] dark:border-[#0B080D] dark:bg-[repeating-linear-gradient(90deg,#31D7C6_0_16%,#FF9B42_16%_32%,#FF4FA3_32%_48%,#4E2A84_48%_64%,#F7EAD8_64%_80%)] dark:shadow-[3px_3px_0_#0B080D]" />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B94F37] dark:text-[#31D7C6]">Case File Closed</p>
            <h1 className="display-font mx-auto mt-3 max-w-4xl text-[clamp(3.25rem,9vw,7rem)] leading-none text-[#33211D] drop-shadow-[5px_5px_0_rgba(246,183,60,0.76)] dark:text-[#F7EAD8] dark:drop-shadow-[5px_5px_0_rgba(255,79,163,0.4)]">
              Voting Results
            </h1>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="evidence-card rounded-[1.6rem] p-5 text-left">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#31D7C6]">Who Voted For Who</p>
                <div className="grid gap-3">
                  {voteHistory.map((entry) => (
                    <div
                      key={entry.player.id}
                      className="soft-enter flex items-center justify-between gap-4 rounded-[1.1rem] border-2 border-[#33211D] bg-[#FFF6E8] px-4 py-3 shadow-[4px_4px_0_rgba(51,33,29,0.32)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[4px_4px_0_#0B080D]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#33211D] bg-[#233A5A] text-sm font-black uppercase text-[#F7EAD8] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:text-[#161218]">
                          {entry.player.name.slice(0, 1)}
                        </span>
                        <span className="truncate text-base font-black">{entry.player.name}</span>
                      </span>
                      <span className="shrink-0 rounded-full border-2 border-[#33211D] bg-[#F8E9D2] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#F7EAD8]">
                        Voted {entry.targetName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="evidence-card rounded-[1.6rem] p-5 text-left">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#31D7C6]">Vote Totals</p>
                <div className="grid gap-4">
                  {voteTally.length ? voteTally.map((entry) => (
                    <div key={entry.id}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black uppercase tracking-[0.08em]">
                        <span>{entry.label}</span>
                        <span>{entry.count}</span>
                      </div>
                      <div className="h-5 rounded-full border-2 border-[#33211D] bg-[#FFF6E8] p-1 shadow-[3px_3px_0_rgba(51,33,29,0.25)] dark:border-[#0B080D] dark:bg-[#161218] dark:shadow-[3px_3px_0_#0B080D]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#F6B73C,#F67A3C)] dark:bg-[linear-gradient(90deg,#31D7C6,#FF4FA3)]"
                          style={{ width: `${Math.round((entry.count / maxVoteCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )) : (
                    <p className="rounded-xl border-2 border-[#33211D] bg-[#FFF6E8] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#775348] dark:border-[#0B080D] dark:bg-[#161218] dark:text-[#F7EAD8]/74">
                      No votes were cast.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#F6B73C,#F67A3C)] p-5 text-left shadow-[6px_7px_0_rgba(51,33,29,0.72)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#FF9B42,#FF4FA3)] dark:text-[#161218] dark:shadow-[6px_7px_0_#0B080D]">
                <p className="text-xs font-black uppercase tracking-[0.14em]">The Imposter</p>
                <p className="display-font mt-3 break-words text-[clamp(2.5rem,7vw,4.6rem)] leading-none">
                  {imposters.map((assignment) => assignment.player.name).join(", ")}
                </p>
              </div>
              <div className="rounded-[1.5rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#FFE2A2)] p-5 text-left shadow-[6px_7px_0_rgba(51,33,29,0.72)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218)] dark:shadow-[6px_7px_0_#0B080D]">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#233A5A] dark:text-[#31D7C6]">Normal Word</p>
                <p className="display-font mt-3 break-words text-[clamp(2.5rem,7vw,4.6rem)] leading-none text-[#33211D] dark:text-[#F7EAD8]">
                  {room.currentRound.wordPair.normalWord}
                </p>
              </div>
              <div className="rounded-[1.5rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFE2C0,#D9829B)] p-5 text-left shadow-[6px_7px_0_rgba(51,33,29,0.72)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#4E2A84,#241B2F)] dark:shadow-[6px_7px_0_#0B080D]">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#233A5A] dark:text-[#FF9B42]">Imposter Word</p>
                <p className="display-font mt-3 break-words text-[clamp(2.5rem,7vw,4.6rem)] leading-none text-[#33211D] dark:text-[#F7EAD8]">
                  {room.currentRound.wordPair.imposterWord}
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-[1.6rem] border-[3px] border-[#33211D] bg-[#FFF6E8] p-5 text-left shadow-[6px_7px_0_rgba(51,33,29,0.7)] dark:border-[#0B080D] dark:bg-[#241B2F] dark:shadow-[6px_7px_0_#0B080D]">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#B94F37] dark:text-[#31D7C6]">Who Solved It</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {room.currentRound.assignments.map((assignment) => {
                  const vote = voteByPlayer.get(assignment.playerId);
                  const guessedCorrectly = Boolean(vote?.targetPlayerId && imposterIds.has(vote.targetPlayerId));
                  return (
                    <div
                      key={assignment.id}
                      className={`soft-enter flex items-center justify-between gap-4 rounded-[1.15rem] border-2 border-[#33211D] px-4 py-3.5 shadow-[4px_4px_0_rgba(51,33,29,0.42)] dark:border-[#0B080D] dark:shadow-[4px_4px_0_#0B080D] ${
                        assignment.isImposter
                          ? "bg-[linear-gradient(135deg,#F6B73C,#F67A3C)] dark:bg-[linear-gradient(135deg,#FF9B42,#FF4FA3)]"
                          : guessedCorrectly
                            ? "bg-[linear-gradient(135deg,#DDE7BE,#FFF6E8)] dark:bg-[linear-gradient(135deg,#31D7C6,#241B2F)]"
                            : "bg-[linear-gradient(135deg,#FFF6E8,#F8E9D2)] dark:bg-[linear-gradient(135deg,#241B2F,#161218)]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#33211D] bg-[#233A5A] text-sm font-black uppercase text-[#F7EAD8] dark:border-[#0B080D] dark:bg-[#31D7C6] dark:text-[#161218]">
                          {assignment.player.name.slice(0, 1)}
                        </span>
                        <span className="truncate text-base font-black text-[#33211D] dark:text-[#F7EAD8]">{assignment.player.name}</span>
                      </span>
                      <span className={`shrink-0 rounded-full border-2 border-[#33211D] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.1em] dark:border-[#0B080D] ${
                        assignment.isImposter
                          ? "bg-[#33211D] text-[#FFF6E8] dark:bg-[#161218] dark:text-[#FF9B42]"
                          : guessedCorrectly
                            ? "bg-[#69733F] text-[#FFF6E8] dark:bg-[#31D7C6] dark:text-[#161218]"
                            : "bg-[#FFF6E8] text-[#233A5A] dark:bg-[#161218] dark:text-[#F7EAD8]"
                      }`}>
                        {assignment.isImposter ? "Imposter" : guessedCorrectly ? "Correct Guess" : "Incorrect Guess"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isHost ? (
              isFinalRound ? (
                <div className="mt-8">
                  <CompleteGameButton roomCode={room.code} playerId={currentPlayerId} />
                </div>
              ) : (
                <form action={startRoundAction.bind(null, room.code)} className="mt-8">
                  <Button type="submit" className="broadcast-button min-h-14 w-full rounded-2xl px-7 text-sm uppercase tracking-[0.14em]">
                    Next Round
                  </Button>
                </form>
              )
            ) : (
              <p className="mt-8 rounded-2xl border-2 border-[#33211D] bg-[#FFF6E8] px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#775348] shadow-[3px_3px_0_rgba(51,33,29,0.24)] dark:border-[#0B080D] dark:bg-[#161218] dark:text-[#F7EAD8]/74 dark:shadow-[3px_3px_0_#0B080D]">
                {isFinalRound
                  ? "All rounds completed. Waiting for host to end game..."
                  : "Waiting for host to launch next round..."}
              </p>
            )}
          </div>
        </section>
      ) : null}

      {room.phase === "ENDED" ? (
        <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-10 text-center text-[#33211D] dark:text-[#F7EAD8] sm:px-8">
          <div className="pointer-events-none absolute inset-0 confetti-dots opacity-55" />
          <div className="soft-enter relative z-10 w-full rounded-[2rem] border-[3px] border-[#33211D] bg-[linear-gradient(135deg,#FFF6E8,#F8E9D2_45%,#F2CFA9)] p-6 shadow-[10px_11px_0_#233A5A,16px_17px_0_rgba(185,79,55,0.18),0_52px_120px_-62px_rgba(51,33,29,0.86)] dark:border-[#0B080D] dark:bg-[linear-gradient(135deg,#241B2F,#161218_52%,#4E2A84)] dark:shadow-[10px_11px_0_#0B080D,16px_17px_0_rgba(255,79,163,0.18),0_0_70px_-38px_rgba(49,215,198,0.74)] sm:p-10">
            <div className="mx-auto mb-7 h-3 w-full max-w-2xl rounded-full border-2 border-[#33211D] bg-[repeating-linear-gradient(90deg,#233A5A_0_16%,#F6B73C_16%_32%,#F67A3C_32%_48%,#D9829B_48%_64%,#69733F_64%_80%)] shadow-[3px_3px_0_rgba(51,33,29,0.28)] dark:border-[#0B080D] dark:bg-[repeating-linear-gradient(90deg,#31D7C6_0_16%,#FF9B42_16%_32%,#FF4FA3_32%_48%,#4E2A84_48%_64%,#F7EAD8_64%_80%)] dark:shadow-[3px_3px_0_#0B080D]" />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B94F37] dark:text-[#31D7C6]">Final Results</p>
            <h1 className="display-font mx-auto mt-3 max-w-4xl text-[clamp(4rem,10vw,8rem)] leading-none drop-shadow-[5px_5px_0_rgba(246,183,60,0.76)] dark:drop-shadow-[5px_5px_0_rgba(255,79,163,0.4)]">
              Game Complete
            </h1>
            <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
              <div className="rounded-[1.35rem] border-[3px] border-[#33211D] bg-[#F6B73C] p-5 shadow-[5px_5px_0_#33211D] dark:border-[#0B080D] dark:bg-[#FF9B42] dark:text-[#161218] dark:shadow-[5px_5px_0_#0B080D]">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.14em]">Room</p>
                <p className="mt-2 font-mono text-xl font-black">{formatRoomCode(room.code)}</p>
              </div>
              <div className="rounded-[1.35rem] border-[3px] border-[#33211D] bg-[#FFF6E8] p-5 shadow-[5px_5px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:shadow-[5px_5px_0_#0B080D]">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#B94F37] dark:text-[#31D7C6]">Rounds</p>
                <p className="mt-2 font-mono text-xl font-black">{room.currentRound.number}</p>
              </div>
              <div className="rounded-[1.35rem] border-[3px] border-[#33211D] bg-[#F67A3C] p-5 shadow-[5px_5px_0_#33211D] dark:border-[#0B080D] dark:bg-[#FF4FA3] dark:text-[#161218] dark:shadow-[5px_5px_0_#0B080D]">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.14em]">Players</p>
                <p className="mt-2 font-mono text-xl font-black">{room.players.filter((roomPlayer) => !roomPlayer.isHost).length}</p>
              </div>
            </div>
            <Link className="broadcast-button mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl px-8 text-sm uppercase tracking-[0.14em]" href="/">Return Home</Link>
          </div>
        </section>
      ) : null}

      <div className="fixed left-5 top-5 z-40 rounded-full border-2 border-[#33211D] bg-[#FFF6E8] px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-[#233A5A] shadow-[3px_3px_0_#33211D] dark:border-[#0B080D] dark:bg-[#241B2F] dark:text-[#31D7C6] dark:shadow-[3px_3px_0_#0B080D]">
        {formatRoomCode(room.code)}
      </div>

      <div className="fixed right-5 top-5 z-40 flex gap-2">
        {deleteRequesterPlayerId ? (
          <DeleteRoomButton roomCode={room.code} requesterPlayerId={deleteRequesterPlayerId} compact />
        ) : null}
        <ExitToLobbyButton
          isHost={isHost}
          roomCode={room.code}
          playerId={currentPlayerId}
          currentRoundNumber={room.currentRound.number}
        />
      </div>
    </main>
  );
}
