import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts";
const DEFAULT_VOICE = process.env.SAMUEL_TTS_VOICE?.trim() || "onyx";
const MAX_TEXT_LENGTH = 2_400;
const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";

type TtsBody = {
  companyId?: string;
  text?: string;
  voice?: string;
};

const BUILTIN_VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);

function cleanSpokenText(value: string) {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function resolveVoice(requested?: string) {
  const normalized = requested?.trim().toLowerCase();
  if (normalized && BUILTIN_VOICES.has(normalized)) return normalized;
  const configured = DEFAULT_VOICE.toLowerCase();
  return BUILTIN_VOICES.has(configured) ? configured : "onyx";
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

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "Voz neural indisponível: OpenAI não configurada.", code: "TTS_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const text = cleanSpokenText(body.text ?? "");
  if (!text) return Response.json({ error: "Texto vazio." }, { status: 400 });

  const voice = resolveVoice(body.voice);
  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(OPENAI_SPEECH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        voice,
        input: text,
        instructions:
          "Fale em português brasileiro natural. Voz masculina adulta, madura e grave, calma, segura e próxima. Ritmo de conversa presencial, frases fluidas, sem tom de locutor, sem exagerar pausas e sem soar robótico. Dê ênfase natural ao significado.",
        response_format: "mp3",
        speed: 1.0,
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Samuel OpenAI TTS unreachable", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: "Voz neural temporariamente indisponível." }, { status: 502 });
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    console.warn("Samuel OpenAI TTS provider error", {
      status: response.status,
      requestId: response.headers.get("x-request-id"),
      providerMessage: payload?.error?.message,
      model: OPENAI_TTS_MODEL,
      latencyMs: Date.now() - startedAt,
    });
    return Response.json(
      {
        error: payload?.error?.message || "Não foi possível gerar a voz neural.",
        code: response.status === 429 ? "TTS_RATE_LIMITED" : "TTS_PROVIDER_ERROR",
      },
      { status: response.status === 429 ? 429 : 502 },
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.byteLength) {
    return Response.json({ error: "O provedor não retornou áudio." }, { status: 502 });
  }

  console.info("Samuel neural TTS generated", {
    provider: "openai",
    model: OPENAI_TTS_MODEL,
    voice,
    bytes: bytes.byteLength,
    latencyMs: Date.now() - startedAt,
  });

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, no-store",
      "X-Samuel-TTS-Provider": "openai",
      "X-Samuel-TTS-Model": OPENAI_TTS_MODEL,
      "X-Samuel-TTS-Voice": voice,
    },
  });
}
