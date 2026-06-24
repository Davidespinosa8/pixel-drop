export type MediaType = "video" | "audio";
export type VideoQuality = "best" | "1080p" | "720p" | "480p";
export type AudioFormat = "mp3" | "m4a";

export interface SelectedFormat {
  type: MediaType;
  quality: VideoQuality | AudioFormat;
}

export interface VideoOption {
  quality: VideoQuality;
  height: number | null;
  estimatedSizeBytes: number | null;
}

export interface AudioOption {
  format: AudioFormat;
  estimatedSizeBytes: number | null;
}

export interface MediaAnalysis {
  title: string;
  channel: string;
  durationSeconds: number;
  thumbnailUrl: string | null;
  videoOptions: VideoOption[];
  audioOptions: AudioOption[];
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
  | "ANALYSIS_FAILED"
  | "DOMAIN_NOT_ALLOWED"
  | "VIDEO_NOT_FOUND"
  | "PRIVATE_VIDEO"
  | "AUTHENTICATION_REQUIRED"
  | "AGE_RESTRICTED"
  | "LIVE_NOT_SUPPORTED"
  | "PLAYLIST_NOT_SUPPORTED"
  | "DURATION_LIMIT_EXCEEDED"
  | "SIZE_LIMIT_EXCEEDED"
  | "ANALYSIS_TIMEOUT"
  | "YTDLP_ERROR"
  | "SERVER_CONFIGURATION_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR";

export type DownloadStage = "preparing" | "downloading";

export type UIState =
  | { phase: "idle" }
  | { phase: "scanning"; url: string }
  | { phase: "ready"; url: string; analysis: MediaAnalysis; selectedFormat: SelectedFormat | null }
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
