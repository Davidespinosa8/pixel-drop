export const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export const VIDEO_QUALITY_LABELS: Record<string, string> = {
  best: "MEJOR CALIDAD",
  "1080p": "1080P",
  "720p": "720P",
  "480p": "480P",
};

export const AUDIO_FORMAT_LABELS: Record<string, string> = {
  mp3: "MP3",
  m4a: "M4A",
};

export const DOWNLOAD_STAGE_LABELS: Record<string, string> = {
  preparing: "PREPARANDO MISIÓN",
  downloading: "RECUPERANDO TRANSMISIÓN",
};
