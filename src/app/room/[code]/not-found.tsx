import Link from "next/link";

export default function RoomNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="display-font text-5xl">Room not found.</h1>
      <p className="mt-3 max-w-md text-[var(--text-muted)]">
        We could not find a room with that code. Check for typos and try again.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--sage-solid)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--sage-hover)]"
      >
        Return Home
      </Link>
    </main>
  );
}
