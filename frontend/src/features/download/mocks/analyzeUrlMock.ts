import type { MediaAnalysis } from "../types";

// Añade ?simulate=error a cualquier URL válida para disparar un error simulado de análisis.
export async function analyzeUrlMock(url: string): Promise<MediaAnalysis> {
  const parsed = new URL(url);

  if (parsed.searchParams.get("simulate") === "error") {
    await delay(900);
    throw new Error("ANALYSIS_FAILED");
  }

  await delay(900);

  return {
    url,
    title: "Transmisión localizada",
    channel: "Canal autorizado",
    durationSeconds: 542,
    availableVideoQualities: ["best", "1080p", "720p", "480p"],
    availableAudioFormats: ["mp3", "m4a"],
    estimatedSizes: {
      best: "~890 MB [SIMULADO]",
      "1080p": "~760 MB [SIMULADO]",
      "720p": "~420 MB [SIMULADO]",
      "480p": "~220 MB [SIMULADO]",
      mp3: "~50 MB [SIMULADO]",
      m4a: "~55 MB [SIMULADO]",
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
