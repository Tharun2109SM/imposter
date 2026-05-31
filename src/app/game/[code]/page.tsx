import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { advancePhaseAction, startRoundAction, submitVoteAction } from "@/server/actions/room-actions";
import { getGameRoom, getHostDeleteCookieName } from "@/server/room-service";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
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

  if (player) {
    const playerExists = room.players.some((p) => p.id === player);
    if (!playerExists) {
      redirect("/?message=removed");
    }
  }

  const hostPlayerId = room.hostPlayerId ?? room.players.find((roomPlayer) => roomPlayer.isHost)?.id;
  const currentPlayerId = player ?? hostPlayerId ?? room.players[0]?.id;
  const isHost = currentPlayerId === hostPlayerId || !player;
  const hasHostDeleteToken =
    cookieStore.get(getHostDeleteCookieName(room.code))?.value === room.hostDeleteToken;
  const deleteRequesterPlayerId = player && player === hostPlayerId && hasHostDeleteToken ? player : null;
  const currentAssignment =
    room.currentRound.assignments.find((assignment) => assignment.playerId === currentPlayerId) ??
    room.currentRound.assignments[0];
  const clueByPlayer = new Map(room.currentRound.clues.map((clue) => [clue.playerId, clue.value]));
  const imposters = room.currentRound.assignments.filter((assignment) => assignment.isImposter);
  const isFinalRound = room.currentRound.number >= room.wordPairs.length;

  return (
    <main className={room.phase === "REVEAL" ? "min-h-screen bg-[#242220]" : "min-h-screen"}>
      <RoomSync roomCode={room.code} playerId={currentPlayerId} broadcastOnMount={isHost} />
      {room.phase === "REVEAL" ? (
        <section className="flex min-h-screen flex-col items-center justify-center px-5 py-10 text-center text-[#f7efe4]">
          {isHost ? (
            <>
              <h1 className="display-font text-4xl mb-4">Players are viewing their secret words</h1>
              <p className="mb-8 text-lg text-[#cfc5b9]">As the Host (Moderator), you do not participate in gameplay.</p>
              <form action={advancePhaseAction.bind(null, room.code)} className="mt-8">
                <Button type="submit">Everyone Has Seen Their Word</Button>
              </form>
            </>
          ) : (
            <>
              <p className="mb-8 text-lg">Keep your screen shielded.</p>
              <RevealCard word={currentAssignment.word} />
              <p className="mt-8 text-sm text-[#cfc5b9]">Release your touch to hide the card.</p>
              <p className="mt-8 text-sm text-[#cfc5b9]">Waiting for the host to continue.</p>
            </>
          )}

          {room.mode === "OFFLINE" && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {room.players.filter(p => !p.isHost).map((p) => (
                <Link
                  key={p.id}
                  href={`/game/${room.code}?player=${p.id}`}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    currentPlayerId === p.id
                      ? "bg-[var(--sage-solid)] text-white"
                      : "bg-[var(--sage-light)] text-[var(--sage-solid)] hover:bg-white"
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
        <section className="mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-6 text-center">
          <header className="flex items-center justify-between text-left">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Offline Game</span>
            <span className="text-sm font-semibold text-[var(--text-muted)]">Round {room.currentRound.number}</span>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Round in Progress</p>
            <h1 className="mt-4 font-mono text-7xl font-bold tabular-nums sm:text-[80px]">04:20</h1>
            <p className="mt-4 text-[var(--text-muted)]">Discuss in your physical space. Vote by pointing at each other.</p>
            {isHost ? (
              <Panel className="mt-10 w-full border-dashed border-[var(--clay-solid)] p-5 text-left">
                <details>
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--clay-solid)]">Show Key</summary>
                  <div className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                    <p>
                      Normal Word: <strong>{room.currentRound.wordPair.normalWord}</strong>
                    </p>
                    <p>
                      Imposter Word: <strong>{room.currentRound.wordPair.imposterWord}</strong>
                    </p>
                    <p>
                      Imposters:{" "}
                      <strong>{imposters.map((assignment) => assignment.player.name).join(", ")}</strong>
                    </p>
                  </div>
                </details>
              </Panel>
            ) : null}
          </div>
          {isHost ? (
            <form action={advancePhaseAction.bind(null, room.code)} className="sticky bottom-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent py-4">
              <Button type="submit" className="w-full">End Round & Reveal Roles</Button>
            </form>
          ) : null}
        </section>
      ) : null}

      {room.phase === "CLUE_SUBMISSION" ? (
        <section className="flex min-h-screen items-center justify-center px-5 py-10">
          {isHost ? (
            <div className="mx-auto max-w-xl text-center">
              <h1 className="display-font text-4xl">Waiting for clues...</h1>
              <p className="mt-3 text-[var(--text-muted)]">
                Players are writing their clues. As the Host, you do not submit clues.
              </p>
              <div className="mt-8 space-y-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                  Submission Status
                </p>
                {room.players.filter(p => !p.isHost).map((p) => {
                  const hasSubmitted = clueByPlayer.has(p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--border-cozy)] bg-white px-4 py-2">
                      <span>{p.name}</span>
                      <span className={hasSubmitted ? "text-[var(--sage-solid)] font-semibold" : "text-[var(--text-muted)]"}>
                        {hasSubmitted ? "Submitted" : "Thinking..."}
                      </span>
                    </div>
                  );
                })}
              </div>
              <form action={advancePhaseAction.bind(null, room.code)} className="mt-8">
                <Button type="submit" className="w-full">Review Clues (Force Advance)</Button>
              </form>
            </div>
          ) : (
            <ClueForm roomCode={room.code} playerId={currentPlayerId} word={currentAssignment.word} />
          )}
        </section>
      ) : null}

      {room.phase === "CLUE_REVIEW" ? (
        <section className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">The Clue Board</p>
              <h1 className="display-font text-4xl">Review the clues.</h1>
            </div>
            <span className="font-mono text-lg font-semibold text-[var(--clay-solid)]">02:40</span>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {room.players.filter(p => !p.isHost).map((roomPlayer) => {
              const clue = clueByPlayer.get(roomPlayer.id);
              return (
                <Panel key={roomPlayer.id} className="min-h-36 p-6 transition hover:scale-[1.02] hover:shadow-[var(--shadow-hover)]">
                  <span className="text-sm font-semibold text-[var(--text-muted)]">{roomPlayer.name}</span>
                  <p className="display-font mt-5 text-3xl italic">{clue ? `"${clue}"` : "Thinking..."}</p>
                </Panel>
              );
            })}
          </div>
          {isHost ? (
            <form action={advancePhaseAction.bind(null, room.code)} className="mt-8">
              <Button type="submit" className="w-full">Open Voting</Button>
            </form>
          ) : null}
        </section>
      ) : null}

      {room.phase === "VOTING" ? (
        <section className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8">
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Cast Your Vote</p>
            <h1 className="display-font text-4xl">
              {isHost ? "Players are voting." : "Identify the Imposter, or choose to skip."}
            </h1>
          </header>
          {isHost ? (
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[var(--text-muted)]">
                As the Host, you do not participate in voting.
              </p>
              <div className="mt-8 space-y-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
                  Voting Status
                </p>
                {room.players.filter(p => !p.isHost).map((p) => {
                  const hasVoted = room.currentRound?.votes.some(v => v.voterId === p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--border-cozy)] bg-white px-4 py-2">
                      <span>{p.name}</span>
                      <span className={hasVoted ? "text-[var(--sage-solid)] font-semibold" : "text-[var(--text-muted)]"}>
                        {hasVoted ? "Voted" : "Deciding..."}
                      </span>
                    </div>
                  );
                })}
              </div>
              <form action={advancePhaseAction.bind(null, room.code)} className="mt-8">
                <Button type="submit" className="w-full">Reveal Results (Force Advance)</Button>
              </form>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {room.players.filter(p => !p.isHost).map((roomPlayer) => (
                  <Panel key={roomPlayer.id} className="p-5">
                    <h2 className="font-semibold">{roomPlayer.name}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">[{clueByPlayer.get(roomPlayer.id) ?? "No clue"}]</p>
                    <form action={submitVoteAction.bind(null, room.code, currentPlayerId, roomPlayer.id)}>
                      <Button type="submit" variant="outline" className="mt-5 w-full">
                        Vote {roomPlayer.name}
                      </Button>
                    </form>
                  </Panel>
                ))}
              </div>
              <form action={submitVoteAction.bind(null, room.code, currentPlayerId, undefined)} className="mt-8 flex justify-center">
                <Button type="submit" variant="outline" className="w-full max-w-md">
                  Skip Voting (Abstain)
                </Button>
              </form>
            </>
          )}
        </section>
      ) : null}

      {room.phase === "RESULTS" ? (
        <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-5 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Round Reveal</p>
          <h1 className="display-font mt-3 text-5xl text-[var(--clay-solid)]">
            The Imposter was: {imposters.map((assignment) => assignment.player.name.toUpperCase()).join(", ")}
          </h1>
          <Panel className="mt-8 grid grid-cols-2 overflow-hidden p-0">
            <div className="border-r border-[var(--border-cozy)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Normal Word</p>
              <p className="display-font mt-2 text-4xl">{room.currentRound.wordPair.normalWord}</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Imposter Word</p>
              <p className="display-font mt-2 text-4xl">{room.currentRound.wordPair.imposterWord}</p>
            </div>
          </Panel>
          <Panel className="mt-6 p-5 text-left">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Results & Roles</p>
            <div className="space-y-3">
              {room.currentRound.assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between rounded-xl bg-[#fffdf9] px-4 py-3">
                  <span>{assignment.player.name}</span>
                  <span className={assignment.isImposter ? "text-[var(--clay-solid)]" : "text-[var(--sage-solid)]"}>
                    {assignment.isImposter ? "Imposter" : "Normal Player"}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
            {isHost ? (
              isFinalRound ? (
                <div className="mt-8">
                  <CompleteGameButton roomCode={room.code} playerId={currentPlayerId} />
                </div>
              ) : (
                <form action={startRoundAction.bind(null, room.code)} className="mt-8">
                  <Button type="submit" className="w-full">Next Round Setup</Button>
                </form>
              )
            ) : (
              <p className="mt-8 text-[var(--text-muted)]">
                {isFinalRound
                  ? "All rounds completed. Waiting for host to end game..."
                  : "Waiting for host to launch next round..."}
              </p>
            )}
        </section>
      ) : null}

      {room.phase === "ENDED" ? (
        <section className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
          <h1 className="display-font text-5xl">Game ended.</h1>
          <Link className="mt-8 text-[var(--sage-solid)]" href="/">Return home</Link>
        </section>
      ) : null}

      <div className="fixed left-5 top-5 rounded-full border border-[var(--border-cozy)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--text-muted)] backdrop-blur">
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
