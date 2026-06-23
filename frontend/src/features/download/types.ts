export type MediaType = "video" | "audio";
export type VideoQuality = "best" | "1080p" | "720p" | "480p";
export type AudioFormat = "mp3" | "m4a";

export interface SelectedFormat {
  type: MediaType;
  quality: VideoQuality | AudioFormat;
}

export interface MediaAnalysis {
  url: string;
  title: string;
  channel: string;
  durationSeconds: number;
  availableVideoQualities: VideoQuality[];
  availableAudioFormats: AudioFormat[];
  estimatedSizes: Record<string, string>;
}

export interface SimulatedFileInfo {
  filename: string;
  format: string;
  size: string;
}

export type ErrorCode =
  | "EMPTY_URL"
  | "INVALID_URL"
  | "FORBIDDEN_PROTOCOL"
  | "FORBIDDEN_DOMAIN"
  | "ANALYSIS_FAILED";

export type DownloadStage = "preparing" | "downloading";

export type UIState =
  | { phase: "idle" }
  | { phase: "scanning"; url: string }
  | { phase: "ready"; analysis: MediaAnalysis; selectedFormat: SelectedFormat | null }
  | {
      phase: "downloading";
      analysis: MediaAnalysis;
      selectedFormat: SelectedFormat;
      progress: number;
      downloadStage: DownloadStage;
    }
  | { phase: "processing"; analysis: MediaAnalysis; selectedFormat: SelectedFormat }
  | {
      phase: "completed";
      analysis: MediaAnalysis;
      selectedFormat: SelectedFormat;
      fileInfo: SimulatedFileInfo;
    }
  | { phase: "error"; errorCode: ErrorCode; message: string }
  | { phase: "cancelled" };
