import type { ReactNode } from "react";

export type PanelVariant = "default" | "highlighted" | "alert";

export interface ArcadePanelProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  variant?: PanelVariant;
  header?: ReactNode;
  className?: string;
}

const variantStyles: Record<PanelVariant, { border: string; shadow: string }> = {
  default:     { border: "border-panel-border",    shadow: "shadow-hard-panel" },
  highlighted: { border: "border-arcade-cyan",     shadow: "shadow-hard-cyan" },
  alert:       { border: "border-arcade-magenta",  shadow: "shadow-hard-magenta" },
};

export function ArcadePanel({
  title,
  subtitle,
  children,
  variant = "default",
  header,
  className = "",
}: ArcadePanelProps) {
  const { border, shadow } = variantStyles[variant];

  return (
    <div
      className={[
        "bg-panel border-2 p-4 md:p-6",
        "animate-panel-enter",
        border,
        shadow,
        className,
      ].join(" ")}
      style={{ borderRadius: 0 }}
    >
      {(title || subtitle || header) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 className="font-arcade text-[11px] md:text-[13px] uppercase tracking-widest text-text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="font-body text-sm text-text-muted">{subtitle}</p>
            )}
          </div>
          {header && <div className="shrink-0">{header}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
