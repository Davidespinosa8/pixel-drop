import type { MediaAnalysis } from "../types";
import { formatSeconds } from "../validateUrl";
import { VideoIcon, AudioIcon } from "@/components/icons";

interface MediaAnalysisResultProps {
  analysis: MediaAnalysis;
}

export function MediaAnalysisResult({ analysis }: MediaAnalysisResultProps) {
  return (
    <div
      className="bg-panel border-2 border-panel-border shadow-hard-panel p-4 flex gap-4 items-start animate-panel-enter"
      style={{ borderRadius: 0 }}
      aria-label="Resultado del análisis"
    >
      <ThumbnailPlaceholder />

      <div className="flex flex-col gap-1 min-w-0">
        <p className="font-arcade text-[10px] uppercase tracking-widest text-arcade-cyan line-clamp-2">
          {analysis.title}
        </p>
        <p className="font-mono text-[12px] text-text-muted">
          {analysis.channel} · {formatSeconds(analysis.durationSeconds)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 font-mono text-[11px] text-text-muted">
            <VideoIcon aria-hidden="true" className="w-3 h-3" />
            {analysis.availableVideoQualities.length} calidades
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-text-muted">
            <AudioIcon aria-hidden="true" className="w-3 h-3" />
            {analysis.availableAudioFormats.length} formatos
          </span>
        </div>
        <span
          className="mt-1 inline-block px-2 py-0 font-arcade text-[8px] uppercase border border-arcade-yellow text-arcade-yellow"
          style={{
            borderRadius: 0,
            backgroundColor: "color-mix(in srgb, var(--color-arcade-yellow) 8%, transparent)",
          }}
        >
          DATOS SIMULADOS
        </span>
      </div>
    </div>
  );
}

function ThumbnailPlaceholder() {
  return (
    <div
      className="shrink-0 w-16 h-9 md:w-[120px] md:h-[68px] bg-panel-border border-2 border-panel-border flex items-center justify-center"
      style={{ borderRadius: 0 }}
      aria-hidden="true"
    >
      <div className="text-text-disabled font-arcade text-[6px] md:text-[8px] text-center leading-tight">
        <div>▣</div>
        <div>VIDEO</div>
      </div>
    </div>
  );
}
