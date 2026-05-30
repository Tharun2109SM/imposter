import { type InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`focus-ring h-12 w-full rounded-lg border border-[var(--border-cozy)] bg-white px-4 text-[15px] text-[var(--text-main)] shadow-[var(--shadow-soft)] placeholder:text-[var(--text-placeholder)] ${className}`}
      {...props}
    />
  );
}

export function Label({
  children,
  htmlFor
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]"
    >
      {children}
    </label>
  );
}
