import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_TTS_MODEL?.trim() || "gemini-3.1-flash-tts-preview";
const DEFAULT_VOICE = process.env.SAMUEL_TTS_VOICE?.trim() || "Gacrux";
const MAX_TEXT_LENGTH = 2_400;
const INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

type TtsBody = {
  companyId?: string;
  text?: string;
  voice?: string;
};

type AudioBlock = {
  type?: string;
  data?: string;
  mime_type?: string;
  mimeType?: string;
  sample_rate?: number;
  sampleRate?: number;
};

function resolveGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null
  );
}

function findAudio(value: unknown): AudioBlock | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    record.type === "audio" &&
    typeof record.data === "string" &&
    record.data.length > 0
  ) {
    return record as AudioBlock;
  }
  for (const nested of Object.values(record)) {
    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = findAudio(item);
        if (found) return found;
      }
    } else if (nested && typeof nested === "object") {
      const found = findAudio(nested);
      if (found) return found;
    }
  }
  return null;
}

function cleanSpokenText(value: string) {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

export async function POST(request: Request) {
  let body: TtsBody;
  try {
    body = (await request.json()) as TtsBody;
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const companyId = body.companyId?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    return Response.json(
      { error: "Voz neural indisponível: Gemini não configurado.", code: "TTS_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const text = cleanSpokenText(body.text ?? "");
  if (!text) return Response.json({ error: "Texto vazio." }, { status: 400 });

  const voice = (body.voice?.trim() || DEFAULT_VOICE).slice(0, 40);
  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(INTERACTIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        "Api-Revision": "2026-05-20",
      },
      body: JSON.stringify({
        model: MODEL,
        input:
          "Sintetize SOMENTE o texto depois de TRANSCRIÇÃO. Português brasileiro natural. Voz masculina adulta, madura, grave, calma, segura e conversacional; ritmo humano, sem tom de locutor, sem ler instruções. TRANSCRIÇÃO: " +
          text,
        response_format: {
          type: "audio",
          mime_type: "audio/wav",
          delivery: "inline",
        },
        generation_config: {
          speech_config: [{ voice, language: "pt-BR" }],
        },
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Samuel neural TTS unreachable", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: "Voz neural temporariamente indisponível." }, { status: 502 });
  }

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    console.warn("Samuel neural TTS provider error", {
      status: response.status,
      model: MODEL,
      latencyMs: Date.now() - startedAt,
    });
    return Response.json(
      { error: "Não foi possível gerar a voz neural.", code: "TTS_PROVIDER_ERROR" },
      { status: response.status === 429 ? 429 : 502 },
    );
  }

  const audio = findAudio(payload);
  if (!audio?.data) {
    console.warn("Samuel neural TTS returned no audio", {
      model: MODEL,
      latencyMs: Date.now() - startedAt,
    });
    return Response.json({ error: "O provedor não retornou áudio." }, { status: 502 });
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(audio.data, "base64");
  } catch {
    return Response.json({ error: "Áudio neural inválido." }, { status: 502 });
  }

  console.info("Samuel neural TTS generated", {
    model: MODEL,
    voice,
    bytes: bytes.byteLength,
    latencyMs: Date.now() - startedAt,
  });

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": audio.mime_type || audio.mimeType || "audio/wav",
      "Cache-Control": "private, no-store",
      "X-Samuel-TTS-Model": MODEL,
      "X-Samuel-TTS-Voice": voice,
    },
  });
}
