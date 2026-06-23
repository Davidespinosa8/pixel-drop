import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AlertIcon } from "@/components/icons";
import type { ErrorCode } from "../types";

interface MissionErrorProps {
  errorCode: ErrorCode;
  message: string;
  onNewMission: () => void;
}

const ERROR_TITLES: Record<ErrorCode, string> = {
  EMPTY_URL: "SEÑAL VACÍA",
  INVALID_URL: "SEÑAL INVÁLIDA",
  FORBIDDEN_PROTOCOL: "PROTOCOLO NO AUTORIZADO",
  FORBIDDEN_DOMAIN: "SEÑAL NO AUTORIZADA",
  ANALYSIS_FAILED: "INTERFERENCIA DETECTADA",
};

export function MissionError({ errorCode, message, onNewMission }: MissionErrorProps) {
  const title = ERROR_TITLES[errorCode] ?? "ERROR DESCONOCIDO";

  return (
    <div
      className="flex flex-col gap-4 animate-panel-enter"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3">
        <AlertIcon aria-hidden="true" className="w-6 h-6 text-arcade-red" />
        <StatusBadge state="error" />
      </div>

      <div
        className="border-2 border-arcade-red p-4 flex flex-col gap-2"
        style={{
          borderRadius: 0,
          backgroundColor: "color-mix(in srgb, var(--color-arcade-red) 8%, transparent)",
        }}
      >
        <p className="font-arcade text-[10px] uppercase tracking-widest text-arcade-red">
          {title}
        </p>
        <p className="font-body text-sm text-text-muted">{message}</p>
      </div>

      <ArcadeButton variant="ghost" onClick={onNewMission} className="w-full md:w-auto">
        NUEVA MISIÓN
      </ArcadeButton>
    </div>
  );
}

export function MissionCancelled({ onNewMission }: { onNewMission: () => void }) {
  return (
    <div
      className="flex flex-col gap-4 animate-panel-enter"
      aria-live="assertive"
      aria-atomic="true"
    >
      <StatusBadge state="neutral" />

      <div
        className="border-2 border-arcade-magenta p-4"
        style={{
          borderRadius: 0,
          backgroundColor: "color-mix(in srgb, var(--color-arcade-magenta) 8%, transparent)",
        }}
      >
        <p className="font-arcade text-[10px] uppercase tracking-widest text-arcade-magenta mb-2">
          MISIÓN ABORTADA
        </p>
        <p className="font-body text-sm text-text-muted">
          La descarga fue cancelada y los archivos temporales han sido eliminados.
        </p>
      </div>

      <ArcadeButton variant="ghost" onClick={onNewMission} className="w-full md:w-auto">
        NUEVA MISIÓN
      </ArcadeButton>
    </div>
  );
}
