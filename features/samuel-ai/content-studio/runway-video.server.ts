import "server-only";

const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";
const RUNWAY_API_VERSION = "2024-11-06";

export type RunwayVideoGeneration = {
  id: string;
  status: "PENDING" | "THROTTLED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED";
  output?: string[];
  failure?: string;
  failureCode?: string;
};

export type RunwayShot = { prompt: string; duration: number };

function apiSecret() {
  const value = process.env.RUNWAYML_API_SECRET?.trim() || process.env.RUNWAY_API_KEY?.trim();
  if (!value) throw new Error("Runway não está configurado no servidor.");
  return value;
}

export function runwayVideoReadiness() {
  const configured = Boolean(process.env.RUNWAYML_API_SECRET?.trim() || process.env.RUNWAY_API_KEY?.trim());
  return {
    configured,
    provider: "Runway",
    model: process.env.RUNWAY_VIDEO_MODEL?.trim() || "gen4.5",
    detail: configured
      ? "Runway conectado para vídeo generativo, referências e sequências multi-shot."
      : "Adicione RUNWAYML_API_SECRET para habilitar vídeo IA premium com referências e multi-shot.",
  };
}

function ratioFor(aspectRatio: "9:16" | "1:1" | "16:9", hd = false) {
  if (aspectRatio === "9:16") return hd ? "1080:1920" : "720:1280";
  if (aspectRatio === "1:1") return hd ? "1440:1440" : "960:960";
  return hd ? "1920:1080" : "1280:720";
}

async function runwayFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${RUNWAY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiSecret()}`,
      "X-Runway-Version": RUNWAY_API_VERSION,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
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
    const message = typeof payload.error === "string"
      ? payload.error
      : typeof payload.message === "string"
        ? payload.message
        : `HTTP ${response.status}`;
    throw new Error(`Runway API: ${message}`);
  }
  return payload;
}

export async function startRunwayVideoGeneration(input: {
  prompt: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  referenceImageUrl?: string | null;
}) {
  const model = process.env.RUNWAY_VIDEO_MODEL?.trim() || "gen4.5";
  if (input.aspectRatio === "1:1" && !input.referenceImageUrl && model === "gen4.5") {
    throw new Error("Para vídeo IA quadrado com Gen-4.5, envie uma imagem de referência.");
  }
  const duration = Math.max(5, Math.min(10, Number(process.env.RUNWAY_VIDEO_DURATION_SECONDS) || 10));
  const body: Record<string, unknown> = {
    model,
    promptText: input.prompt.slice(0, 1_000),
    ratio: ratioFor(input.aspectRatio),
    duration,
  };
  if (input.referenceImageUrl) body.promptImage = input.referenceImageUrl;

  const payload = await runwayFetch("/image_to_video", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const id = typeof payload.id === "string" ? payload.id : "";
  if (!id) throw new Error("A Runway não devolveu o identificador da geração.");
  return { id, model, durationSeconds: duration, generationMode: "single-shot" as const };
}

export async function startRunwayMultiShotGeneration(input: {
  prompt: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  referenceImageUrl?: string | null;
  shots?: RunwayShot[];
  resolution?: "720p" | "1080p";
  generateAudio?: boolean;
}) {
  const requestedDuration = input.shots?.reduce((sum, shot) => sum + shot.duration, 0) || 15;
  const duration = requestedDuration <= 5 ? 5 : requestedDuration <= 10 ? 10 : 15;
  const validShots = (input.shots ?? [])
    .map((shot) => ({ prompt: shot.prompt.trim().slice(0, 512), duration: Math.max(1, Math.round(shot.duration)) }))
    .filter((shot) => shot.prompt)
    .slice(0, 5);

  let body: Record<string, unknown>;
  if (validShots.length >= 3) {
    const rawTotal = validShots.reduce((sum, shot) => sum + shot.duration, 0);
    const scaled = validShots.map((shot, index) => ({
      prompt: shot.prompt,
      duration: index === validShots.length - 1
        ? 0
        : Math.max(1, Math.round((shot.duration / rawTotal) * duration)),
    }));
    const allocated = scaled.slice(0, -1).reduce((sum, shot) => sum + shot.duration, 0);
    scaled[scaled.length - 1].duration = Math.max(1, duration - allocated);
    body = {
      version: "2026-06",
      mode: "custom",
      duration,
      ratio: ratioFor(input.aspectRatio, input.resolution === "1080p"),
      shots: scaled,
      audio: input.generateAudio ?? true,
    };
  } else {
    body = {
      version: "2026-06",
      mode: "auto",
      prompt: input.prompt.slice(0, 2_500),
      duration,
      ratio: ratioFor(input.aspectRatio, input.resolution === "1080p"),
      audio: input.generateAudio ?? true,
    };
  }
  if (input.referenceImageUrl) body.firstFrame = { uri: input.referenceImageUrl };

  const payload = await runwayFetch("/recipes/multi_shot_video", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const id = typeof payload.id === "string" ? payload.id : "";
  if (!id) throw new Error("A Runway não devolveu o identificador do vídeo multi-shot.");
  return { id, model: "multi-shot-video", durationSeconds: duration, generationMode: "multi-shot" as const };
}

export async function getRunwayVideoGeneration(taskId: string): Promise<RunwayVideoGeneration> {
  if (!/^[A-Za-z0-9_-]{8,160}$/.test(taskId)) throw new Error("Identificador de tarefa Runway inválido.");
  const payload = await runwayFetch(`/tasks/${encodeURIComponent(taskId)}`) as Record<string, unknown>;
  const status = typeof payload.status === "string" ? payload.status.toUpperCase() : "";
  if (!payload.id || !status) throw new Error("Resposta inválida da Runway ao consultar o vídeo.");
  return {
    id: String(payload.id),
    status: status as RunwayVideoGeneration["status"],
    output: Array.isArray(payload.output) ? payload.output.filter((item): item is string => typeof item === "string") : undefined,
    failure: typeof payload.failure === "string" ? payload.failure : typeof payload.error === "string" ? payload.error : undefined,
    failureCode: typeof payload.failureCode === "string" ? payload.failureCode : undefined,
  };
}
