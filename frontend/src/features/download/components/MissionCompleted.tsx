import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DownloadIcon, SuccessIcon } from "@/components/icons";
import type { SimulatedFileInfo } from "../types";

interface MissionCompletedProps {
  fileInfo: SimulatedFileInfo;
  onNewMission: () => void;
}

export function MissionCompleted({ fileInfo, onNewMission }: MissionCompletedProps) {
  return (
    <div className="flex flex-col gap-6 animate-panel-enter" aria-live="polite">
      <div className="flex items-center gap-3">
        <SuccessIcon aria-hidden="true" className="w-6 h-6 text-arcade-green" />
        <StatusBadge state="success" />
      </div>

      <div
        className="bg-panel border-2 border-arcade-green p-4 flex flex-col gap-2"
        style={{
          borderRadius: 0,
          backgroundColor: "color-mix(in srgb, var(--color-arcade-green) 6%, transparent)",
        }}
      >
        <p className="font-mono text-[13px] text-text-primary break-all">
          {fileInfo.filename}
        </p>
        <p className="font-mono text-[12px] text-text-muted">
          {fileInfo.format} · {fileInfo.size}
        </p>
      </div>

      <div
        className="border-2 border-panel-border p-3"
        style={{ borderRadius: 0 }}
        role="note"
      >
        <p className="font-arcade text-[9px] uppercase tracking-widest text-text-muted mb-1">
          OBTENER ARCHIVO — DEMO
        </p>
        <p className="font-body text-sm text-text-muted">
          La descarga real se habilitará al conectar el motor.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <ArcadeButton variant="primary" disabled className="w-full md:w-auto">
          <DownloadIcon aria-hidden="true" />
          OBTENER ARCHIVO
        </ArcadeButton>
        <ArcadeButton variant="ghost" onClick={onNewMission} className="w-full md:w-auto">
          NUEVA MISIÓN
        </ArcadeButton>
      </div>
    </div>
  );
}
