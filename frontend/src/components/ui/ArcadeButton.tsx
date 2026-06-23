import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  danger:    "btn-danger",
  ghost:     "btn-ghost",
};

export function ArcadeButton({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ArcadeButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "px-4 py-3 min-h-[44px] min-w-[44px]",
        "font-arcade text-[11px] uppercase tracking-widest",
        "cursor-pointer disabled:cursor-not-allowed",
        variantClass[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-signal-blink" aria-hidden="true">■</span>
          <span>{children}</span>
          <span className="animate-signal-blink" aria-hidden="true" style={{ animationDelay: "0.4s" }}>■</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
