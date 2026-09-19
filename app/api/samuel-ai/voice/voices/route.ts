import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  resolveElevenLabsVoiceId,
  resolveElevenLabsVoiceName,
} from "@/features/samuel-ai/voice/samuel-tts-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VoiceOption = {
  id: string;
  name: string;
  provider: "elevenlabs" | "openai";
  category: string | null;
  description: string | null;
  previewUrl: string | null;
  labels: Record<string, string>;
};

const OPENAI_VOICES = ["coral", "shimmer", "nova", "sage", "marin", "cedar"] as const;

function safeHttps(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function labels(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .slice(0, 16),
  );
}

export async function GET(request: Request) {
  const companyId =
    new URL(request.url).searchParams.get("companyId")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const voices: VoiceOption[] = [];
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (apiKey) {
    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v2/voices?page_size=100&include_total_count=false",
        {
          headers: { "xi-api-key": apiKey },
          cache: "no-store",
          signal: AbortSignal.timeout(12_000),
        },
      );
      const payload = (await response.json().catch(() => null)) as
        | { voices?: Array<Record<string, unknown>>; detail?: unknown }
        | null;
      if (!response.ok) {
        throw new Error(`ElevenLabs HTTP ${response.status}`);
      }

      for (const item of payload?.voices ?? []) {
        const id = typeof item.voice_id === "string" ? item.voice_id.trim() : "";
        const name = typeof item.name === "string" ? item.name.trim() : "";
        if (!/^[A-Za-z0-9_-]{8,128}$/.test(id) || !name) continue;
        voices.push({
          id,
          name: name.slice(0, 100),
          provider: "elevenlabs",
          category: typeof item.category === "string" ? item.category.slice(0, 80) : null,
          description:
            typeof item.description === "string" ? item.description.slice(0, 320) : null,
          previewUrl: safeHttps(item.preview_url),
          labels: labels(item.labels),
        });
      }
    } catch (error) {
      console.warn("Samuel voice catalog could not load ElevenLabs voices", {
        message: error instanceof Error ? error.message : String(error),
      });
    }

    const configuredId = resolveElevenLabsVoiceId();
    if (!voices.some((voice) => voice.id === configuredId)) {
      voices.unshift({
        id: configuredId,
        name: resolveElevenLabsVoiceName(),
        provider: "elevenlabs",
        category: "configured",
        description: "Voz configurada atualmente no SF Growth AI.",
        previewUrl: null,
        labels: {},
      });
    }
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    for (const name of OPENAI_VOICES) {
      voices.push({
        id: name,
        name: `OpenAI · ${name}`,
        provider: "openai",
        category: "builtin",
        description: "Voz neural OpenAI disponível como alternativa/failover.",
        previewUrl: null,
        labels: {},
      });
    }
  }

  return Response.json(
    {
      voices,
      defaultVoice: apiKey
        ? { provider: "elevenlabs" as const, id: resolveElevenLabsVoiceId() }
        : process.env.OPENAI_API_KEY?.trim()
          ? { provider: "openai" as const, id: process.env.SAMUEL_TTS_VOICE?.trim() || "coral" }
          : null,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
