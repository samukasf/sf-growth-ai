import {
  liveProviderReadiness,
  resolveGeminiLiveModel,
  resolveSamuelLiveProvider,
} from "@/apps/web/src/core/orchestrator/live-provider.server";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  resolveElevenLabsVoiceId,
  ttsProviderReadiness,
} from "@/features/samuel-ai/voice/samuel-tts-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function probeGeminiToken(apiKey: string) {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | { name?: string; error?: { status?: string; message?: string } }
      | null;
    return {
      ok: response.ok && Boolean(payload?.name),
      status: response.status,
      providerStatus: payload?.error?.status ?? null,
      message: response.ok ? null : payload?.error?.message ?? "Gemini token probe failed",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      providerStatus: "UNREACHABLE",
      message: error instanceof Error ? error.message : "Gemini token probe failed",
    };
  }
}

async function probeElevenLabsVoice(apiKey: string, voiceId: string) {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`,
      {
        headers: { "xi-api-key": apiKey },
        cache: "no-store",
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | {
          name?: string;
          category?: string;
          labels?: Record<string, string>;
          detail?: { status?: string; message?: string } | string;
        }
      | null;
    const detail = payload?.detail;
    return {
      ok: response.ok && Boolean(payload?.name),
      status: response.status,
      name: response.ok ? payload?.name ?? null : null,
      category: response.ok ? payload?.category ?? null : null,
      labels: response.ok ? payload?.labels ?? null : null,
      providerStatus:
        !response.ok && detail && typeof detail === "object" ? detail.status ?? null : null,
      message: response.ok
        ? null
        : typeof detail === "string"
          ? detail
          : detail?.message ?? "ElevenLabs voice probe failed",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      name: null,
      category: null,
      labels: null,
      providerStatus: "UNREACHABLE",
      message: error instanceof Error ? error.message : "ElevenLabs voice probe failed",
    };
  }
}

export async function GET(request: Request) {
  const companyId = request.headers.get("x-samuel-company-id")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const preferredProvider = resolveSamuelLiveProvider();
  const readiness = liveProviderReadiness();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY?.trim();
  const tts = ttsProviderReadiness();
  const shouldProbe = new URL(request.url).searchParams.get("probe") === "1";
  const geminiProbe = shouldProbe && geminiKey ? await probeGeminiToken(geminiKey) : null;
  const elevenLabsProbe = shouldProbe && elevenLabsKey
    ? await probeElevenLabsVoice(elevenLabsKey, resolveElevenLabsVoiceId())
    : null;

  return Response.json({
    ok: true,
    companyId,
    preferredProvider,
    preferredReadiness: readiness,
    realtime: {
      gemini: {
        configured: Boolean(geminiKey),
        model: resolveGeminiLiveModel(),
        tokenProbe: geminiProbe,
      },
      openai: {
        configured: Boolean(openAiKey),
        model: process.env.OPENAI_REALTIME_MODEL?.trim() || "gpt-realtime-2.1",
        creditStatus: "not_probeable_without_starting_a_billable_session",
      },
    },
    tts: {
      preferredProvider: tts.preferredProvider,
      configuredOrder: tts.order,
      elevenlabs: {
        ...tts.elevenlabs,
        voiceProbe: elevenLabsProbe,
      },
      openai: tts.openai,
    },
    fallback: {
      capture: "AudioContext PCM/WAV",
      transcriptionOrder: ["elevenlabs", "openai", "gemini"],
      speechOrder: [...tts.order, "browser", "piper"],
      browserTts: true,
      piperTts: true,
    },
    serverTime: new Date().toISOString(),
  }, { headers: { "cache-control": "no-store" } });
}
