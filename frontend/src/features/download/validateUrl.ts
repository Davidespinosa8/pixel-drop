import type { ErrorCode } from "./types";
import { ALLOWED_HOSTS } from "./constants";

export type UrlValidationResult =
  | { ok: true; url: URL }
  | { ok: false; errorCode: ErrorCode; message: string };

export function validateUrl(value: string): UrlValidationResult {
  if (!value.trim()) {
    return { ok: false, errorCode: "EMPTY_URL", message: "Ingresa una URL de YouTube." };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, errorCode: "INVALID_URL", message: "La URL no es válida." };
  }

  if (url.protocol !== "https:") {
    return {
      ok: false,
      errorCode: "FORBIDDEN_PROTOCOL",
      message: "Solo se aceptan URLs con protocolo HTTPS.",
    };
  }

  if (!ALLOWED_HOSTS.has(url.hostname)) {
    return {
      ok: false,
      errorCode: "FORBIDDEN_DOMAIN",
      message: "Dominio no autorizado. Solo se aceptan URLs de YouTube.",
    };
  }

  return { ok: true, url };
}

export function formatBytes(bytes: number | null | undefined): string | undefined {
  if (!bytes) return undefined;
  if (bytes >= 1_073_741_824) return `~${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `~${Math.round(bytes / 1_048_576)} MB`;
  return `~${Math.round(bytes / 1024)} KB`;
}

export function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
