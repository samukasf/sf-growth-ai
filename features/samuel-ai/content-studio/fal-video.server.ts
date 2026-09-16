import "server-only";

const FAL_QUEUE_BASE = "https://queue.fal.run";

export type FalVideoMode = "image-to-video" | "motion-control";
export type FalVideoGeneration = {
  id: string;
  statusUrl: string;
  responseUrl: string;
  model: string;
  durationSeconds: number;
};

function falKey() {
  const value = process.env.FAL_KEY?.trim();
  if (!value) throw new Error("fal.ai não está configurada no servidor. Adicione FAL_KEY para ativar geração profissional de vídeo.");
  return value;
}

export function falVideoReadiness() {
  const configured = Boolean(process.env.FAL_KEY?.trim());
  return {
    configured,
    provider: "fal.ai",
    model: process.env.FAL_VIDEO_MODEL?.trim() || "fal-ai/kling-video/v3/standard/image-to-video",
    detail: configured
      ? "fal.ai conectado para image-to-video, movimento de personagem e cenas generativas."
      : "Adicione FAL_KEY para habilitar Kling/Vidu/LTX e outros modelos de vídeo via fal.ai.",
  };
}

async function falPost(model: string, input: Record<string, unknown>) {
  const response = await fetch(`${FAL_QUEUE_BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  const text = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = text ? JSON.parse(text) as Record<string, unknown> : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok) {
    const message = typeof payload.detail === "string"
      ? payload.detail
      : typeof payload.message === "string"
        ? payload.message
        : `HTTP ${response.status}`;
    throw new Error(`fal.ai Video API: ${message}`);
  }
  return payload;
}

export async function startFalVideoGeneration(input: {
  prompt: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  referenceImageUrl: string;
  referenceVideoUrl?: string | null;
  mode?: FalVideoMode;
  generateAudio?: boolean;
}) : Promise<FalVideoGeneration> {
  const mode: FalVideoMode = input.mode === "motion-control" ? "motion-control" : "image-to-video";
  const duration = Math.max(5, Math.min(10, Number(process.env.FAL_VIDEO_DURATION_SECONDS) || 10));
  const model = mode === "motion-control"
    ? (process.env.FAL_MOTION_MODEL?.trim() || "fal-ai/kling-video/v3/standard/motion-control")
    : (process.env.FAL_VIDEO_MODEL?.trim() || "fal-ai/kling-video/v3/standard/image-to-video");

  const requestInput: Record<string, unknown> = mode === "motion-control"
    ? {
        prompt: input.prompt.slice(0, 2_500),
        image_url: input.referenceImageUrl,
        video_url: input.referenceVideoUrl,
        character_orientation: "video",
        keep_original_sound: false,
      }
    : {
        prompt: input.prompt.slice(0, 2_500),
        image_url: input.referenceImageUrl,
        duration: `${duration}`,
        aspect_ratio: input.aspectRatio,
        generate_audio: input.generateAudio ?? true,
      };

  if (mode === "motion-control" && !input.referenceVideoUrl) {
    throw new Error("Para transferir movimentos para a sua foto, envie também um vídeo de movimento como referência.");
  }

  const payload = await falPost(model, requestInput);
  const id = typeof payload.request_id === "string" ? payload.request_id : "";
  const statusUrl = typeof payload.status_url === "string" ? payload.status_url : "";
  const responseUrl = typeof payload.response_url === "string" ? payload.response_url : "";
  if (!id || !statusUrl || !responseUrl) throw new Error("fal.ai não devolveu os dados necessários para acompanhar a geração.");
  return { id, statusUrl, responseUrl, model, durationSeconds: duration };
}

async function authorizedGet(url: string) {
  if (!url.startsWith("https://")) throw new Error("URL de acompanhamento fal.ai inválida.");
  const response = await fetch(url, {
    headers: { Authorization: `Key ${falKey()}` },
    cache: "no-store",
  });
  const text = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = text ? JSON.parse(text) as Record<string, unknown> : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `fal.ai HTTP ${response.status}`);
  return payload;
}

export async function getFalVideoGeneration(statusUrl: string, responseUrl: string) {
  const statusPayload = await authorizedGet(statusUrl);
  const status = typeof statusPayload.status === "string" ? statusPayload.status.toUpperCase() : "IN_QUEUE";
  if (["FAILED", "CANCELLED", "CANCELED"].includes(status)) {
    const error = typeof statusPayload.error === "string" ? statusPayload.error : "A geração fal.ai falhou.";
    return { status: "failed" as const, error };
  }
  if (status !== "COMPLETED") return { status: "generating" as const };

  const result = await authorizedGet(responseUrl);
  const video = result.video as { url?: string; content_type?: string } | undefined;
  const url = typeof video?.url === "string"
    ? video.url
    : typeof result.video_url === "string"
      ? result.video_url
      : "";
  if (!url) throw new Error("fal.ai concluiu a tarefa, mas não devolveu o vídeo final.");
  return { status: "completed" as const, url, mimeType: video?.content_type || "video/mp4" };
}
