import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "clay" | "destructive";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--navy-solid)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--sage-hover)] hover:shadow-[0_0_36px_rgba(245,166,35,0.22)]",
  outline:
    "border border-[var(--border-cozy)] bg-[#fffaf0] text-[var(--text-main)] shadow-[var(--shadow-soft)] hover:border-[#edae73] hover:bg-white hover:shadow-[var(--shadow-hover)]",
  ghost:
    "text-[var(--text-muted)] hover:bg-white/70 hover:text-[var(--text-main)]",
  clay:
    "bg-[var(--amber-light)] text-[var(--navy-solid)] hover:bg-[#ffe49a] hover:shadow-[var(--shadow-soft)]",
  destructive:
    "bg-[var(--clay-solid)] text-white hover:bg-[var(--clay-solid)]/90 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)]"
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`pressable focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-black ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
