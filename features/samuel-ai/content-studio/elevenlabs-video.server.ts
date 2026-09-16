import "server-only";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

export type ElevenVideoGeneration = {
  id: string;
  status: "pending" | "generating" | "completed" | "failed";
  content_url?: string;
  content_mime_type?: string;
  failure_reason?: string;
  error_message?: string;
};

export function elevenVideoReadiness() {
  const hasApiKey = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const videoExplicitlyEnabled = process.env.ELEVENLABS_VIDEO_ENABLED?.trim().toLowerCase() === "true";
  const configured = hasApiKey && videoExplicitlyEnabled;
  return {
    configured,
    provider: "ElevenLabs Image & Video API",
    model: process.env.ELEVENLABS_VIDEO_MODEL?.trim() || "veo-3.1-fast-generate-001",
    detail: configured
      ? "Vídeo IA externo ElevenLabs habilitado explicitamente no servidor."
      : hasApiKey
        ? "A narração ElevenLabs está configurada, mas o vídeo externo foi desativado porque a chave ainda não teve acesso Image & Video/Flows confirmado. O renderizador Samuel continua gerando vídeo normalmente."
        : "ElevenLabs não está configurada para vídeo externo. O renderizador Samuel continua disponível sem esta API.",
  };
}

function apiKey() {
  const value = process.env.ELEVENLABS_API_KEY?.trim();
  if (!value) throw new Error("ElevenLabs não está configurada no servidor.");
  return value;
}

async function elevenFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${ELEVENLABS_API_BASE}${path}`, {
    ...init,
    headers: {
      "xi-api-key": apiKey(),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  let payload: unknown = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok) {
    const record = payload as { detail?: unknown; message?: string };
    const detail = typeof record.message === "string"
      ? record.message
      : typeof record.detail === "string"
        ? record.detail
        : text || `HTTP ${response.status}`;
    if (response.status === 402) {
      throw new Error("A chave ElevenLabs atual não tem acesso confirmado ao recurso Image & Video/Flows. Use o renderizador Samuel ou configure Runway para vídeo IA externo.");
    }
    throw new Error(`ElevenLabs Video API: ${detail}`);
  }
  return payload;
}

export async function startElevenVideoGeneration(input: {
  prompt: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  resolution?: "720p" | "1080p";
}) {
  if (!elevenVideoReadiness().configured) {
    throw new Error("Vídeo externo ElevenLabs não está habilitado. Defina ELEVENLABS_VIDEO_ENABLED=true somente depois de confirmar acesso Image & Video/Flows na chave API.");
  }
  const modelId = process.env.ELEVENLABS_VIDEO_MODEL?.trim() || "veo-3.1-fast-generate-001";
  const duration = Math.max(4, Math.min(8, Number(process.env.ELEVENLABS_VIDEO_DURATION_SECONDS) || 8));
  const resolution = input.resolution ?? (process.env.ELEVENLABS_VIDEO_RESOLUTION?.trim() === "720p" ? "720p" : "1080p");
  const payload = await elevenFetch("/flows/video", {
    method: "POST",
    body: JSON.stringify({
      model_id: modelId,
      prompt: input.prompt.slice(0, 3_500),
      duration_secs: duration,
      aspect_ratio: input.aspectRatio,
      resolution,
      generate_audio: false,
    }),
  }) as { id?: string; status?: string };

  if (!payload.id) throw new Error("A ElevenLabs não devolveu o identificador da geração de vídeo.");
  return {
    id: payload.id,
    status: payload.status ?? "pending",
    model: modelId,
    durationSeconds: duration,
    resolution,
  };
}

export async function getElevenVideoGeneration(generationId: string): Promise<ElevenVideoGeneration> {
  if (!/^[A-Za-z0-9_-]{8,160}$/.test(generationId)) throw new Error("Identificador de geração ElevenLabs inválido.");
  const payload = await elevenFetch(`/flows/video/${encodeURIComponent(generationId)}`) as ElevenVideoGeneration;
  if (!payload.id || !payload.status) throw new Error("Resposta inválida da ElevenLabs ao consultar o vídeo.");
  return payload;
}
