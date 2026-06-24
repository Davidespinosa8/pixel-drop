import { z } from "zod";

import type { MediaAnalysis } from "@/features/download/types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");
const ANALYZE_TIMEOUT_MS = 35_000;

// ── Response schemas ──────────────────────────────────────────────────────────

const VideoOptionSchema = z.object({
  quality: z.enum(["best", "1080p", "720p", "480p"]),
  height: z.number().nullable(),
  estimatedSizeBytes: z.number().nullable(),
});

const AudioOptionSchema = z.object({
  format: z.enum(["mp3", "m4a"]),
  estimatedSizeBytes: z.number().nullable(),
});

const AnalyzeResponseSchema = z.object({
  title: z.string(),
  channel: z.string(),
  durationSeconds: z.number(),
  thumbnailUrl: z.string().nullable(),
  videoOptions: z.array(VideoOptionSchema),
  audioOptions: z.array(AudioOptionSchema),
});

const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

// ── Error types ───────────────────────────────────────────────────────────────

export type BackendErrorCode =
  | "INVALID_URL"
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

const ERROR_MESSAGES: Record<BackendErrorCode, string> = {
  INVALID_URL: "La URL no es válida.",
  DOMAIN_NOT_ALLOWED: "Dominio no autorizado. Solo se aceptan URLs de YouTube.",
  VIDEO_NOT_FOUND: "El video no existe o fue eliminado.",
  PRIVATE_VIDEO: "El video es privado y no es accesible desde este servidor.",
  AUTHENTICATION_REQUIRED: "El video requiere inicio de sesión para acceder.",
  AGE_RESTRICTED: "El video tiene restricción de edad y no puede analizarse.",
  LIVE_NOT_SUPPORTED: "Las transmisiones en vivo no están soportadas.",
  PLAYLIST_NOT_SUPPORTED: "Las playlists no están soportadas. Pega la URL de un video individual.",
  DURATION_LIMIT_EXCEEDED: "El video supera la duración máxima permitida.",
  SIZE_LIMIT_EXCEEDED: "El archivo estimado supera el tamaño máximo permitido.",
  ANALYSIS_TIMEOUT: "El análisis tardó demasiado. Intenta de nuevo.",
  YTDLP_ERROR: "Error al analizar el video. Verifica la URL e intenta de nuevo.",
  SERVER_CONFIGURATION_ERROR: "Error de configuración del servidor.",
  TIMEOUT: "El servidor tardó demasiado en responder. Intenta de nuevo.",
  NETWORK_ERROR: "No se pudo conectar con el servidor. Verifica tu conexión.",
};

export class ApiError extends Error {
  constructor(
    public readonly code: BackendErrorCode,
    public readonly userMessage: string,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

// ── analyzeUrl ────────────────────────────────────────────────────────────────

export async function analyzeUrl(url: string): Promise<MediaAnalysis> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError("TIMEOUT", ERROR_MESSAGES.TIMEOUT);
      }
      throw new ApiError("NETWORK_ERROR", ERROR_MESSAGES.NETWORK_ERROR);
    }

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const parsed = ErrorResponseSchema.safeParse(body);
      const code = parsed.success
        ? (parsed.data.error.code as BackendErrorCode)
        : "YTDLP_ERROR";
      const message = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.YTDLP_ERROR;
      throw new ApiError(code, message);
    }

    const parsed = AnalyzeResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("YTDLP_ERROR", ERROR_MESSAGES.YTDLP_ERROR);
    }

    const d = parsed.data;
    return {
      title: d.title,
      channel: d.channel,
      durationSeconds: d.durationSeconds,
      thumbnailUrl: d.thumbnailUrl,
      videoOptions: d.videoOptions,
      audioOptions: d.audioOptions,
    };
  } finally {
    clearTimeout(timer);
  }
}
