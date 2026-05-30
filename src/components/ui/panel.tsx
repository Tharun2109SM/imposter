export function Panel({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border-cozy)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}
