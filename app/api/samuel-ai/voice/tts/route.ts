import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  InvalidTtsProviderError,
  generateSamuelSpeech,
  normalizeElevenLabsVoiceId,
} from "@/features/samuel-ai/voice/samuel-tts-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 2_400;

type TtsBody = {
  companyId?: string;
  text?: string;
  provider?: "elevenlabs" | "openai";
  voice?: string;
  elevenLabsVoiceId?: string;
};

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

  const text = cleanSpokenText(body.text ?? "");
  if (!text) return Response.json({ error: "Texto vazio." }, { status: 400 });

  const requestedElevenLabsVoiceId = body.elevenLabsVoiceId?.trim();
  if (requestedElevenLabsVoiceId && !normalizeElevenLabsVoiceId(requestedElevenLabsVoiceId)) {
    return Response.json({ error: "Voice ID ElevenLabs inválido." }, { status: 400 });
  }

  let generation: Awaited<ReturnType<typeof generateSamuelSpeech>>;
  try {
    generation = await generateSamuelSpeech({
      text,
      requestedProvider: body.provider,
      requestedOpenAiVoice: body.voice,
      requestedElevenLabsVoiceId,
      signal: request.signal,
    });
  } catch (error) {
    if (error instanceof InvalidTtsProviderError) {
      console.error("Samuel TTS provider configuration is invalid", {
        code: error.code,
        message: error.message,
      });
      return Response.json(
        { error: "A configuração da voz neural é inválida.", code: error.code },
        { status: 500 },
      );
    }
    throw error;
  }

  if (!generation.ok) {
    console.error("Samuel neural TTS exhausted providers", {
      code: generation.code,
      attempts: generation.attempts.map((attempt) => ({
        provider: attempt.provider,
        status: attempt.status,
        code: attempt.code,
        requestId: attempt.requestId,
        latencyMs: attempt.latencyMs,
        providerMessage: attempt.message,
      })),
    });
    return Response.json(
      {
        error: generation.code === "TTS_NOT_CONFIGURED"
          ? "Voz neural indisponível: nenhum provedor configurado."
          : "A voz neural está temporariamente indisponível.",
        code: generation.code,
      },
      { status: generation.status },
    );
  }

  if (generation.fallback) {
    console.warn("Samuel neural TTS used provider failover", {
      provider: generation.provider,
      model: generation.model,
      failedProviders: generation.attempts.map((attempt) => ({
        provider: attempt.provider,
        status: attempt.status,
        code: attempt.code,
        requestId: attempt.requestId,
      })),
    });
  }

  console.info("Samuel neural TTS generated", {
    provider: generation.provider,
    model: generation.model,
    voice: generation.voice,
    bytes: generation.audio.byteLength,
    latencyMs: generation.latencyMs,
    fallback: generation.fallback,
    requestId: generation.requestId,
  });

  return new Response(generation.audio, {
    status: 200,
    headers: {
      "Content-Type": generation.contentType,
      "Content-Length": String(generation.audio.byteLength),
      "Cache-Control": "private, no-store",
      "X-Samuel-TTS-Provider": generation.provider,
      "X-Samuel-TTS-Model": generation.model,
      "X-Samuel-TTS-Voice": generation.voice,
      "X-Samuel-TTS-Fallback": String(generation.fallback),
      ...(generation.requestId
        ? { "X-Samuel-TTS-Request-Id": generation.requestId }
        : {}),
    },
  });
}
