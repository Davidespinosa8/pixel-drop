import { SegmentedProgress } from "@/components/ui/SegmentedProgress";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DOWNLOAD_STAGE_LABELS } from "../constants";
import type { DownloadStage } from "../types";

interface MissionProgressProps {
  title: string;
  phase: "downloading" | "processing";
  downloadStage?: DownloadStage;
  progress: number;
  onAbort: () => void;
}

export function MissionProgress({
  title,
  phase,
  downloadStage,
  progress,
  onAbort,
}: MissionProgressProps) {
  const stageLabel =
    phase === "processing"
      ? "PROCESANDO TRANSMISIÓN"
      : downloadStage
        ? DOWNLOAD_STAGE_LABELS[downloadStage]
        : "DESCARGANDO";

  return (
    <div className="flex flex-col gap-6" aria-live="polite" aria-atomic="false">
      <p className="font-arcade text-[11px] uppercase tracking-widest text-text-primary line-clamp-1">
        {title}
      </p>

      <StatusBadge
        state={phase === "processing" ? "processing" : "downloading"}
      />

      <div className="flex flex-col gap-2">
        <p className="font-arcade text-[9px] uppercase tracking-widest text-text-muted">
          {stageLabel}
        </p>
        {phase === "downloading" ? (
          <SegmentedProgress value={progress} />
        ) : (
          <ProcessingIndicator />
        )}
      </div>

      <ArcadeButton variant="danger" onClick={onAbort} className="w-full md:w-auto">
        ABORTAR MISIÓN
      </ArcadeButton>
    </div>
  );
}

function ProcessingIndicator() {
  return (
    <div
      className="flex gap-[2px] flex-1 h-4"
      role="progressbar"
      aria-label="Procesando transmisión"
      aria-valuetext="En curso"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="flex-1 bg-arcade-violet animate-progress-pulse"
          style={{ borderRadius: 0, animationDelay: `${i * 0.066}s` }}
        />
      ))}
    </div>
  );
}
