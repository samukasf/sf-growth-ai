import {
  liveProviderReadiness,
  resolveGeminiLiveModel,
  resolveSamuelLiveProvider,
} from "@/apps/web/src/core/orchestrator/live-provider.server";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { getGoogleIntegrationStatus } from "@/features/google-integrations/google-capabilities.server";
import {
  SAMUEL_VOICE_PRE_ROLL_MS,
  SAMUEL_VOICE_SAMPLE_RATE,
} from "@/features/samuel-ai/voice/samuel-turn-detector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function probeGeminiToken(apiKey: string) {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      method: "GET",
      headers: { "x-goog-api-key": apiKey },
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | { models?: unknown[]; error?: { status?: string; message?: string } }
      | null;
    return {
      ok: response.ok,
      status: response.status,
      providerStatus: payload?.error?.status ?? null,
      message: response.ok ? null : payload?.error?.message ?? "Gemini key probe failed",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      providerStatus: "UNREACHABLE",
      message: error instanceof Error ? error.message : "Gemini key probe failed",
    };
  }
}

async function probeOpenAiKey(apiKey: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    return {
      ok: response.ok,
      status: response.status,
      message: response.ok ? null : payload?.error?.message ?? "OpenAI key probe failed",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : "OpenAI key probe failed",
    };
  }
}

export async function GET(request: Request) {
  const companyId = request.headers.get("x-samuel-company-id")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const shouldProbe = url.searchParams.get("probe") === "1";
  const preferredProvider = resolveSamuelLiveProvider();
  const readiness = liveProviderReadiness();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const [geminiProbe, openAiProbe, google] = await Promise.all([
    shouldProbe && geminiKey ? probeGeminiToken(geminiKey) : Promise.resolve(null),
    shouldProbe && openAiKey ? probeOpenAiKey(openAiKey) : Promise.resolve(null),
    UUID_PATTERN.test(companyId)
      ? getGoogleIntegrationStatus(companyId).catch((error) => ({
          error: error instanceof Error ? error.message : "Falha ao validar Google.",
        }))
      : Promise.resolve(null),
  ]);

  return Response.json(
    {
      ok: true,
      companyId,
      voicePipeline: {
        primaryMode: "continuous-pcm",
        microphone: {
          persistentSession: true,
          echoCancellationRequested: true,
          noiseSuppressionRequested: true,
          autoGainControlRequested: true,
          canonicalSampleRate: SAMUEL_VOICE_SAMPLE_RATE,
          preRollMs: SAMUEL_VOICE_PRE_ROLL_MS,
        },
        turnDetection: {
          local: true,
          adaptiveNoiseFloor: true,
          separateBargeInGate: true,
          transcriptEchoRejection: true,
          fastStopCommands: true,
        },
        transcription: {
          primary: "openai",
          primaryModel:
            process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || "gpt-4o-mini-transcribe",
          failover: geminiKey ? "gemini" : null,
          failoverModel:
            process.env.GEMINI_TRANSCRIPTION_MODEL?.trim() || "gemini-2.5-flash",
        },
        responseAudio: {
          primary: "openai",
          model: process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts",
          voice: process.env.SAMUEL_TTS_VOICE?.trim() || "onyx",
          immediatelyCancellable: true,
          fallbacks: ["browser-speech-synthesis", "piper-local"],
        },
        tools: {
          sharedWithTextChat: true,
          spokenConfirmation: true,
          calendar: true,
          gmail: true,
          desktop: true,
        },
        telemetry: {
          serverRoute: "/api/samuel-ai/voice/telemetry",
          enabled: true,
        },
      },
      realtimeAccelerator: {
        preferredProvider,
        preferredReadiness: readiness,
        optional: true,
        gemini: {
          configured: Boolean(geminiKey),
          model: resolveGeminiLiveModel(),
          keyProbe: geminiProbe,
        },
        openai: {
          configured: Boolean(openAiKey),
          model: process.env.OPENAI_REALTIME_MODEL?.trim() || "gpt-realtime-2.1",
          keyProbe: openAiProbe,
        },
      },
      google,
      serverTime: new Date().toISOString(),
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
