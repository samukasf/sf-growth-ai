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
  const configured = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  return {
    configured,
    provider: "ElevenLabs Image & Video API",
    model: process.env.ELEVENLABS_VIDEO_MODEL?.trim() || "veo-3.1-fast-generate-001",
    detail: configured
      ? "Vídeo IA MP4 disponível; a conta ElevenLabs precisa de plano Pro+ e permissão Image & Video/Flows."
      : "Configure ELEVENLABS_API_KEY para gerar vídeo IA MP4 no servidor.",
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
      throw new Error("A API de vídeo da ElevenLabs exige plano Pro ou superior e permissão Image & Video/Flows na chave API.");
    }
    throw new Error(`ElevenLabs Video API: ${detail}`);
  }
  return payload;
}

export async function startElevenVideoGeneration(input: {
  prompt: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
}) {
  const modelId = process.env.ELEVENLABS_VIDEO_MODEL?.trim() || "veo-3.1-fast-generate-001";
  const duration = Math.max(4, Math.min(8, Number(process.env.ELEVENLABS_VIDEO_DURATION_SECONDS) || 8));
  const resolution = process.env.ELEVENLABS_VIDEO_RESOLUTION?.trim() || "1080p";
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
  };
}

export async function getElevenVideoGeneration(generationId: string): Promise<ElevenVideoGeneration> {
  if (!/^[A-Za-z0-9_-]{8,160}$/.test(generationId)) throw new Error("Identificador de geração ElevenLabs inválido.");
  const payload = await elevenFetch(`/flows/video/${encodeURIComponent(generationId)}`) as ElevenVideoGeneration;
  if (!payload.id || !payload.status) throw new Error("Resposta inválida da ElevenLabs ao consultar o vídeo.");
  return payload;
}
