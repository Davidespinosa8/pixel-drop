export type BadgeState =
  | "neutral"
  | "scanning"
  | "downloading"
  | "processing"
  | "success"
  | "error"
  | "expired";

export interface StatusBadgeProps {
  state: BadgeState;
  className?: string;
}

interface BadgeConfig {
  label: string;
  color: string;
  animate?: boolean;
}

const configs: Record<BadgeState, BadgeConfig> = {
  neutral:     { label: "EN ESPERA",             color: "var(--color-text-muted)" },
  scanning:    { label: "ESCANEANDO SEÑAL",       color: "var(--color-arcade-cyan)",    animate: true },
  downloading: { label: "DESCARGANDO",            color: "var(--color-arcade-cyan)",    animate: true },
  processing:  { label: "PROCESANDO TRANSMISIÓN", color: "var(--color-arcade-violet)",  animate: true },
  success:     { label: "MISIÓN COMPLETADA",      color: "var(--color-arcade-green)" },
  error:       { label: "INTERFERENCIA DETECTADA",color: "var(--color-arcade-red)" },
  expired:     { label: "SEÑAL EXPIRADA",         color: "var(--color-arcade-yellow)" },
};

export function StatusBadge({ state, className = "" }: StatusBadgeProps) {
  const { label, color, animate } = configs[state];

  return (
    <span
      className={[
        "inline-flex items-center gap-2 px-2 py-1",
        "font-arcade text-[10px] uppercase tracking-widest",
        "border-2",
        animate ? "animate-signal-blink" : "",
        className,
      ].join(" ")}
      style={{
        borderRadius: 0,
        borderColor: color,
        color,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      <span aria-hidden="true">■</span>
      {label}
    </span>
  );
}
