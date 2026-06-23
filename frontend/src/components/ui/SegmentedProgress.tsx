export interface SegmentedProgressProps {
  value: number;
  showText?: boolean;
  className?: string;
}

export function SegmentedProgress({
  value,
  showText = true,
  className = "",
}: SegmentedProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const desktopSegments = 20;
  const mobileSegments = 12;

  return (
    <div className={["flex items-center gap-3", className].join(" ")}>
      {/* Mobile: 12 segments — aria-hidden porque display:none en ≥md oculta de AT */}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso: ${clamped}%`}
        aria-hidden="true"
        className="flex gap-[2px] flex-1 md:hidden"
      >
        {Array.from({ length: mobileSegments }, (_, i) => {
          const threshold = ((i + 1) / mobileSegments) * 100;
          const active = clamped >= threshold;
          return (
            <div
              key={i}
              className={[
                "h-4 flex-1",
                active
                  ? "bg-arcade-cyan animate-progress-pulse shadow-glow-cyan"
                  : "bg-panel-border",
              ].join(" ")}
              style={{ borderRadius: 0 }}
            />
          );
        })}
      </div>

      {/* Desktop: 20 segments — accesible; display:none en <md oculta de AT */}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso: ${clamped}%`}
        className="hidden md:flex gap-[2px] flex-1"
      >
        {Array.from({ length: desktopSegments }, (_, i) => {
          const threshold = ((i + 1) / desktopSegments) * 100;
          const active = clamped >= threshold;
          return (
            <div
              key={i}
              className={[
                "h-4 flex-1",
                active
                  ? "bg-arcade-cyan animate-progress-pulse shadow-glow-cyan"
                  : "bg-panel-border",
              ].join(" ")}
              style={{ borderRadius: 0 }}
            />
          );
        })}
      </div>

      {showText && (
        <span className="font-mono text-[13px] text-text-muted w-10 text-right shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
}
