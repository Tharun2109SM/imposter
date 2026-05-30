import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "clay";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--sage-solid)] text-white hover:bg-[var(--sage-hover)] shadow-[var(--shadow-soft)]",
  outline:
    "border border-[var(--border-cozy)] bg-white text-[var(--text-main)] hover:bg-[#f4efeb]",
  ghost:
    "text-[var(--text-muted)] hover:bg-white/70",
  clay:
    "bg-[var(--clay-light)] text-[var(--clay-solid)] hover:bg-[#f2ded8]"
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition duration-200 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
