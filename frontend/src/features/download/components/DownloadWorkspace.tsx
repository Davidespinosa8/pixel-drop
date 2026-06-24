"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArcadePanel } from "@/components/ui/ArcadePanel";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { RocketIcon } from "@/components/icons";
import { UrlScanner } from "./UrlScanner";
import { MediaAnalysisResult } from "./MediaAnalysisResult";
import { FormatSelector } from "./FormatSelector";
import { MissionProgress } from "./MissionProgress";
import { MissionCompleted } from "./MissionCompleted";
import { MissionError, MissionCancelled } from "./MissionError";
import { CancelConfirmModal } from "./CancelConfirmModal";
import { analyzeUrl, ApiError } from "@/lib/apiClient";
import { formatBytes } from "../validateUrl";
import type { UIState, SelectedFormat, SimulatedFileInfo, DownloadStage, MediaAnalysis } from "../types";

const PROGRESS_INTERVAL_MS = 300;
const PROGRESS_STEP = 5;
const PROCESSING_DURATION_MS = 1500;

export function DownloadWorkspace() {
  const [state, setState] = useState<UIState>({ phase: "idle" });
  const [showCancelModal, setShowCancelModal] = useState(false);

  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, []);

  function clearTimers() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function startProcessingTransition(
    analysis: MediaAnalysis,
    selectedFormat: SelectedFormat,
  ) {
    setState({ phase: "processing", analysis, selectedFormat });
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setState({
        phase: "completed",
        analysis,
        selectedFormat,
        fileInfo: buildFileInfo(analysis.title, selectedFormat, analysis),
      });
    }, PROCESSING_DURATION_MS);
  }

  async function handleScan(url: string) {
    setState({ phase: "scanning", url });
    try {
      const analysis = await analyzeUrl(url);
      if (!mountedRef.current) return;
      setState({ phase: "ready", url, analysis, selectedFormat: null });
    } catch (err) {
      if (!mountedRef.current) return;
      if (err instanceof ApiError) {
        setState({
          phase: "error",
          errorCode: err.code,
          message: err.userMessage,
        });
      } else {
        setState({
          phase: "error",
          errorCode: "ANALYSIS_FAILED",
          message: "No se pudieron obtener los metadatos del video. Verifica la URL e intenta de nuevo.",
        });
      }
    }
  }

  function handleFormatChange(format: SelectedFormat) {
    setState((prev) => {
      if (prev.phase !== "ready") return prev;
      return { ...prev, selectedFormat: format };
    });
  }

  function handleStartMission() {
    if (state.phase !== "ready" || !state.selectedFormat) return;
    const { analysis, selectedFormat } = state;

    progressRef.current = 0;
    setState({
      phase: "downloading",
      analysis,
      selectedFormat,
      progress: 0,
      downloadStage: "preparing",
    });

    clearTimers();
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;

      progressRef.current += PROGRESS_STEP;
      const next = progressRef.current;

      if (next >= 80) {
        clearTimers();
        startProcessingTransition(analysis, selectedFormat);
        return;
      }

      const downloadStage: DownloadStage = next < 30 ? "preparing" : "downloading";
      setState((prev) => {
        if (prev.phase !== "downloading") return prev;
        return { ...prev, progress: next, downloadStage };
      });
    }, PROGRESS_INTERVAL_MS);
  }

  const handleAbortRequest = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  function handleContinueMission() {
    setShowCancelModal(false);
  }

  function handleConfirmAbort() {
    setShowCancelModal(false);
    clearTimers();
    setState({ phase: "cancelled" });
  }

  function handleNewMission() {
    clearTimers();
    setState({ phase: "idle" });
  }

  function handleClearLock() {
    clearTimers();
    setState({ phase: "idle" });
  }

  const phase = state.phase;
  const showUrlArea = phase === "idle" || phase === "scanning" || phase === "ready";
  const lockedUrl =
    phase === "scanning"
      ? state.url
      : phase === "ready"
        ? state.url
        : undefined;

  return (
    <>
      <div className="flex flex-col gap-6">
        <p className="font-mono text-[11px] text-text-muted tracking-widest">
          SISTEMA DE RECUPERACIÓN MULTIMEDIA — SOLO PARA USO AUTORIZADO
        </p>

        {showUrlArea && (
          <ArcadePanel variant={phase === "ready" ? "default" : "highlighted"}>
            <UrlScanner
              onScan={handleScan}
              scanning={phase === "scanning"}
              lockedUrl={lockedUrl}
              onClearLock={phase === "ready" ? handleClearLock : undefined}
            />
            {phase === "scanning" && (
              <div className="mt-4 flex flex-col gap-2" role="status" aria-live="polite">
                <div className="font-arcade text-[10px] uppercase tracking-widest text-arcade-cyan animate-signal-blink">
                  ■ ESCANEANDO SEÑAL
                </div>
                <p className="font-body text-sm text-text-muted">
                  Obteniendo metadatos del video...
                </p>
              </div>
            )}
          </ArcadePanel>
        )}

        {phase === "ready" && (
          <ArcadePanel>
            <div className="flex flex-col gap-6">
              <MediaAnalysisResult analysis={state.analysis} />
              <FormatSelector
                analysis={state.analysis}
                selected={state.selectedFormat}
                onChange={handleFormatChange}
              />
              <ArcadeButton
                variant="primary"
                disabled={!state.selectedFormat}
                onClick={handleStartMission}
                className="w-full md:w-auto"
              >
                <RocketIcon aria-hidden="true" />
                INICIAR MISIÓN
              </ArcadeButton>
            </div>
          </ArcadePanel>
        )}

        {(phase === "downloading" || phase === "processing") && (
          <ArcadePanel variant="highlighted">
            <MissionProgress
              title={state.analysis.title}
              phase={phase}
              downloadStage={phase === "downloading" ? state.downloadStage : undefined}
              progress={phase === "downloading" ? state.progress : 80}
              onAbort={handleAbortRequest}
            />
          </ArcadePanel>
        )}

        {phase === "completed" && (
          <ArcadePanel>
            <MissionCompleted fileInfo={state.fileInfo} onNewMission={handleNewMission} />
          </ArcadePanel>
        )}

        {phase === "error" && (
          <ArcadePanel variant="alert">
            <MissionError
              errorCode={state.errorCode}
              message={state.message}
              onNewMission={handleNewMission}
            />
          </ArcadePanel>
        )}

        {phase === "cancelled" && (
          <ArcadePanel>
            <MissionCancelled onNewMission={handleNewMission} />
          </ArcadePanel>
        )}
      </div>

      <CancelConfirmModal
        open={showCancelModal}
        onContinue={handleContinueMission}
        onAbort={handleConfirmAbort}
      />
    </>
  );
}

function buildFileInfo(
  title: string,
  format: SelectedFormat,
  analysis: MediaAnalysis,
): SimulatedFileInfo {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const ext = format.type === "audio" ? (format.quality as string) : "mp4";
  const fmt = format.type === "audio" ? (format.quality as string).toUpperCase() : "MP4";

  let size = "Tamaño desconocido";
  if (format.type === "video") {
    const opt = analysis.videoOptions.find((v) => v.quality === format.quality);
    size = formatBytes(opt?.estimatedSizeBytes) ?? "Tamaño desconocido";
  } else {
    const opt = analysis.audioOptions.find((a) => a.format === format.quality);
    size = formatBytes(opt?.estimatedSizeBytes) ?? "Tamaño desconocido";
  }

  return { filename: `${slug}.${ext}`, format: fmt, size };
}
