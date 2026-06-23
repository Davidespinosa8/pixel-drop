"use client";

import type { MediaAnalysis, SelectedFormat, MediaType, VideoQuality, AudioFormat } from "../types";
import { VIDEO_QUALITY_LABELS, AUDIO_FORMAT_LABELS } from "../constants";
import { VideoIcon, AudioIcon } from "@/components/icons";

interface FormatSelectorProps {
  analysis: MediaAnalysis;
  selected: SelectedFormat | null;
  onChange: (format: SelectedFormat) => void;
}

export function FormatSelector({ analysis, selected, onChange }: FormatSelectorProps) {
  const activeType: MediaType = selected?.type ?? "video";

  function selectType(type: MediaType) {
    if (type === "video") {
      onChange({ type: "video", quality: analysis.availableVideoQualities[0] });
    } else {
      onChange({ type: "audio", quality: analysis.availableAudioFormats[0] });
    }
  }

  function selectQuality(quality: VideoQuality | AudioFormat) {
    onChange({ type: activeType, quality });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Type tabs */}
      <div role="group" aria-label="Tipo de descarga" className="flex gap-2">
        <TypeTab
          id="type-video"
          label="VIDEO"
          icon={<VideoIcon aria-hidden="true" className="w-4 h-4" />}
          active={activeType === "video"}
          onClick={() => selectType("video")}
        />
        <TypeTab
          id="type-audio"
          label="AUDIO"
          icon={<AudioIcon aria-hidden="true" className="w-4 h-4" />}
          active={activeType === "audio"}
          onClick={() => selectType("audio")}
        />
      </div>

      {/* Quality options */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-arcade text-[9px] uppercase tracking-widest text-text-muted mb-2">
          {activeType === "video" ? "Calidad de video (MP4)" : "Formato de audio"}
        </legend>

        {activeType === "video" &&
          analysis.availableVideoQualities.map((q) => (
            <QualityOption
              key={q}
              id={`quality-${q}`}
              name="quality"
              label={VIDEO_QUALITY_LABELS[q] ?? q}
              sublabel={analysis.estimatedSizes[q]}
              checked={selected?.type === "video" && selected.quality === q}
              onChange={() => selectQuality(q)}
            />
          ))}

        {activeType === "audio" &&
          analysis.availableAudioFormats.map((f) => (
            <QualityOption
              key={f}
              id={`format-${f}`}
              name="quality"
              label={AUDIO_FORMAT_LABELS[f] ?? f}
              sublabel={analysis.estimatedSizes[f]}
              checked={selected?.type === "audio" && selected.quality === f}
              onChange={() => selectQuality(f)}
            />
          ))}
      </fieldset>
    </div>
  );
}

interface TypeTabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function TypeTab({ id, label, icon, active, onClick }: TypeTabProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex items-center gap-2 px-4 py-2 min-h-[44px]",
        "font-arcade text-[10px] uppercase tracking-widest",
        "border-2 transition-colors",
        active
          ? "border-arcade-cyan text-arcade-cyan bg-panel"
          : "border-panel-border text-text-muted hover:border-text-muted",
      ].join(" ")}
      style={{ borderRadius: 0 }}
    >
      {icon}
      {label}
    </button>
  );
}

interface QualityOptionProps {
  id: string;
  name: string;
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: () => void;
}

function QualityOption({ id, name, label, sublabel, checked, onChange }: QualityOptionProps) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex items-center gap-3 px-3 py-2 cursor-pointer border-2",
        "transition-colors",
        checked
          ? "border-arcade-cyan bg-panel"
          : "border-panel-border hover:border-text-muted",
      ].join(" ")}
      style={{ borderRadius: 0 }}
    >
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={[
          "w-3 h-3 border-2 flex items-center justify-center shrink-0",
          checked ? "border-arcade-cyan" : "border-text-muted",
        ].join(" ")}
        style={{ borderRadius: 0 }}
        aria-hidden="true"
      >
        {checked && (
          <span className="w-1.5 h-1.5 bg-arcade-cyan" style={{ borderRadius: 0 }} />
        )}
      </span>
      <span className="font-arcade text-[10px] uppercase tracking-widest text-text-primary flex-1">
        {label}
      </span>
      {sublabel && (
        <span className="font-mono text-[11px] text-text-muted">{sublabel}</span>
      )}
    </label>
  );
}
