import Link from "next/link";

export default function GameNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="display-font text-5xl">No active round.</h1>
      <p className="mt-3 max-w-md text-[var(--text-muted)]">Return to the lobby and deal words to begin.</p>
      <Link className="mt-8 text-[var(--sage-solid)]" href="/">
        Return Home
      </Link>
    </main>
  );
}
