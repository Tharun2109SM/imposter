export function Panel({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`party-card rounded-[1.75rem] border border-[var(--border-cozy)] shadow-[var(--shadow-soft)] transition-shadow duration-300 ${className}`}
    >
      {children}
    </section>
  );
}
