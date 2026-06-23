"use client";

import { useState, type FormEvent } from "react";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { ArcadeInput } from "@/components/ui/ArcadeInput";
import { CloseIcon, SignalIcon } from "@/components/icons";
import { validateUrl } from "../validateUrl";

interface UrlScannerProps {
  onScan: (url: string) => void;
  scanning?: boolean;
  lockedUrl?: string;
  onClearLock?: () => void;
}

export function UrlScanner({ onScan, scanning, lockedUrl, onClearLock }: UrlScannerProps) {
  const [value, setValue] = useState("");
  const [urlError, setUrlError] = useState("");

  function handleChange(raw: string) {
    setValue(raw);
    if (!raw.trim()) {
      setUrlError("");
      return;
    }
    const result = validateUrl(raw);
    setUrlError(result.ok ? "" : result.message);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = validateUrl(value);
    if (!result.ok) {
      setUrlError(result.message);
      return;
    }
    setUrlError("");
    onScan(value);
  }

  if (lockedUrl) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex-1 px-3 py-3 font-body text-sm bg-panel border-2 border-panel-border text-text-muted overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ borderRadius: 0 }}
          title={lockedUrl}
        >
          {lockedUrl}
        </div>
        {onClearLock && (
          <button
            type="button"
            onClick={onClearLock}
            aria-label="Limpiar URL e iniciar nueva búsqueda"
            className="p-3 bg-panel border-2 border-panel-border text-text-muted hover:text-text-primary hover:border-text-muted focus-visible:outline-2 focus-visible:outline-arcade-cyan shrink-0"
            style={{ borderRadius: 0 }}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <ArcadeInput
        label="Señal de transmisión"
        id="url-signal"
        type="url"
        inputMode="url"
        autoComplete="off"
        required
        disabled={scanning}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        error={urlError || undefined}
        placeholder="https://youtube.com/watch?v=..."
        prefix={<SignalIcon />}
      />
      <ArcadeButton
        type="submit"
        variant="primary"
        disabled={!value.trim() || !!urlError || scanning}
        loading={scanning}
        className="w-full md:w-auto"
      >
        <SignalIcon aria-hidden="true" />
        {scanning ? "ESCANEANDO..." : "ESCANEAR SEÑAL"}
      </ArcadeButton>
      <p className="font-body text-sm text-text-muted">
        Pega una URL de YouTube para comenzar
      </p>
    </form>
  );
}
