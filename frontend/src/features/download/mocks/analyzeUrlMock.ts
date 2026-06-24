import type { MediaAnalysis } from "../types";

// Solo para pruebas. Añade ?simulate=error a cualquier URL válida para disparar un error simulado.
export async function analyzeUrlMock(url: string): Promise<MediaAnalysis> {
  const parsed = new URL(url);

  if (parsed.searchParams.get("simulate") === "error") {
    await delay(900);
    throw new Error("ANALYSIS_FAILED");
  }

  await delay(900);

  return {
    title: "Transmisión localizada",
    channel: "Canal autorizado",
    durationSeconds: 542,
    thumbnailUrl: null,
    videoOptions: [
      { quality: "best", height: null, estimatedSizeBytes: 933_642_240 },
      { quality: "1080p", height: 1080, estimatedSizeBytes: 797_376_512 },
      { quality: "720p", height: 720, estimatedSizeBytes: 440_401_920 },
      { quality: "480p", height: 480, estimatedSizeBytes: 230_686_720 },
    ],
    audioOptions: [
      { format: "m4a", estimatedSizeBytes: 57_671_680 },
      { format: "mp3", estimatedSizeBytes: 52_428_800 },
    ],
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
