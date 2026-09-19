export type SamuelTtsProvider = "elevenlabs" | "openai";

export type SamuelTtsAttempt = {
  provider: SamuelTtsProvider;
  status: number;
  code: string;
  message: string;
  requestId: string | null;
  latencyMs: number;
};

export type SamuelTtsGeneration =
  | {
      ok: true;
      provider: SamuelTtsProvider;
      model: string;
      voice: string;
      contentType: string;
      audio: ArrayBuffer;
      requestId: string | null;
      latencyMs: number;
      fallback: boolean;
      attempts: SamuelTtsAttempt[];
    }
  | {
      ok: false;
      status: number;
      code: string;
      attempts: SamuelTtsAttempt[];
    };

export const DEFAULT_ELEVENLABS_MODEL = "eleven_flash_v2_5";
export const DEFAULT_ELEVENLABS_VOICE_ID = "YklVF5l1Q8os8glyd5SM";
export const DEFAULT_ELEVENLABS_VOICE_NAME = "Camilla";
export const DEFAULT_ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128";
export const DEFAULT_OPENAI_TTS_MODEL = "gpt-4o-mini-tts";
export const DEFAULT_OPENAI_TTS_VOICE = "coral";

const ELEVENLABS_SPEECH_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech";
const PROVIDER_TIMEOUT_MS = 20_000;
const OPENAI_BUILTIN_VOICES = new Set([
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

export class InvalidTtsProviderError extends Error {
  readonly code = "TTS_PROVIDER_INVALID";

  constructor(provider: string) {
    super(`Provedor TTS inválido: ${provider}`);
    this.name = "InvalidTtsProviderError";
  }
}

export function resolveElevenLabsModel(env: NodeJS.ProcessEnv = process.env) {
  return env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_ELEVENLABS_MODEL;
}

export function resolveElevenLabsVoiceId(env: NodeJS.ProcessEnv = process.env) {
  return (
    env.ELEVENLABS_FEMALE_VOICE_ID?.trim() ||
    env.ELEVENLABS_VOICE_ID?.trim() ||
    DEFAULT_ELEVENLABS_VOICE_ID
  );
}

export function normalizeElevenLabsVoiceId(value?: string | null) {
  const voiceId = value?.trim() ?? "";
  return /^[A-Za-z0-9_-]{8,128}$/.test(voiceId) ? voiceId : null;
}

export function resolveElevenLabsVoiceName(env: NodeJS.ProcessEnv = process.env) {
  if (resolveElevenLabsVoiceId(env) === DEFAULT_ELEVENLABS_VOICE_ID) {
    return DEFAULT_ELEVENLABS_VOICE_NAME;
  }
  return (
    env.ELEVENLABS_FEMALE_VOICE_NAME?.trim() ||
    env.ELEVENLABS_VOICE_NAME?.trim() ||
    "Camilla"
  );
}

export function resolveElevenLabsOutputFormat(env: NodeJS.ProcessEnv = process.env) {
  const configured = env.ELEVENLABS_OUTPUT_FORMAT?.trim().toLowerCase();
  return configured && /^mp3_\d+_\d+$/.test(configured)
    ? configured
    : DEFAULT_ELEVENLABS_OUTPUT_FORMAT;
}

export function resolveOpenAiTtsModel(env: NodeJS.ProcessEnv = process.env) {
  return env.OPENAI_TTS_MODEL?.trim() || DEFAULT_OPENAI_TTS_MODEL;
}

export function resolveOpenAiTtsVoice(requested?: string, env: NodeJS.ProcessEnv = process.env) {
  const requestedVoice = requested?.trim().toLowerCase();
  if (requestedVoice && OPENAI_BUILTIN_VOICES.has(requestedVoice)) return requestedVoice;

  const configured = env.SAMUEL_TTS_VOICE?.trim().toLowerCase();
  return configured && OPENAI_BUILTIN_VOICES.has(configured)
    ? configured
    : DEFAULT_OPENAI_TTS_VOICE;
}

export function resolveSamuelTtsProvider(env: NodeJS.ProcessEnv = process.env): SamuelTtsProvider {
  const explicit = env.SAMUEL_TTS_PROVIDER?.trim().toLowerCase();
  if (explicit && explicit !== "auto") {
    if (explicit !== "elevenlabs" && explicit !== "openai") {
      throw new InvalidTtsProviderError(explicit);
    }
    return explicit;
  }

  if (env.ELEVENLABS_API_KEY?.trim()) return "elevenlabs";
  if (env.OPENAI_API_KEY?.trim()) return "openai";
  return "elevenlabs";
}

export function ttsProviderReadiness(env: NodeJS.ProcessEnv = process.env) {
  const preferredProvider = resolveSamuelTtsProvider(env);
  const configured = {
    elevenlabs: Boolean(env.ELEVENLABS_API_KEY?.trim()),
    openai: Boolean(env.OPENAI_API_KEY?.trim()),
  } satisfies Record<SamuelTtsProvider, boolean>;
  const fallbackProvider: SamuelTtsProvider =
    preferredProvider === "elevenlabs" ? "openai" : "elevenlabs";
  const order = [preferredProvider, fallbackProvider].filter(
    (provider) => configured[provider],
  );

  return {
    preferredProvider,
    order,
    elevenlabs: {
      configured: configured.elevenlabs,
      model: resolveElevenLabsModel(env),
      voiceName: resolveElevenLabsVoiceName(env),
      customVoice: Boolean(
        env.ELEVENLABS_FEMALE_VOICE_ID?.trim() || env.ELEVENLABS_VOICE_ID?.trim(),
      ),
      outputFormat: resolveElevenLabsOutputFormat(env),
      missingKey: configured.elevenlabs ? null : "ELEVENLABS_API_KEY",
    },
    openai: {
      configured: configured.openai,
      model: resolveOpenAiTtsModel(env),
      voice: resolveOpenAiTtsVoice(undefined, env),
      missingKey: configured.openai ? null : "OPENAI_API_KEY",
    },
  } as const;
}

function providerRequestId(response: Response) {
  return response.headers.get("request-id") || response.headers.get("x-request-id");
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (typeof record.detail === "string") return record.detail;
  if (record.detail && typeof record.detail === "object") {
    const detail = record.detail as Record<string, unknown>;
    if (typeof detail.message === "string") return detail.message;
  }
  if (record.error && typeof record.error === "object") {
    const error = record.error as Record<string, unknown>;
    if (typeof error.message === "string") return error.message;
  }
  return fallback;
}

async function readProviderError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  return errorMessage(payload, fallback).slice(0, 500);
}

function providerFailureCode(provider: SamuelTtsProvider, status: number) {
  const prefix = provider === "elevenlabs" ? "ELEVENLABS" : "OPENAI";
  if (status === 401 || status === 403) return `${prefix}_AUTH_ERROR`;
  if (status === 422 || status === 400) return `${prefix}_INVALID_REQUEST`;
  if (status === 429) return `${prefix}_RATE_LIMITED`;
  if (status === 408 || status === 504) return `${prefix}_TIMEOUT`;
  return `${prefix}_PROVIDER_ERROR`;
}

function combinedSignal(signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(PROVIDER_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function generateWithElevenLabs(
  text: string,
  requestedVoiceId: string | undefined,
  env: NodeJS.ProcessEnv,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): Promise<SamuelTtsGeneration | SamuelTtsAttempt> {
  const provider = "elevenlabs" as const;
  const apiKey = env.ELEVENLABS_API_KEY?.trim();
  const model = resolveElevenLabsModel(env);
  const voice = normalizeElevenLabsVoiceId(requestedVoiceId) || resolveElevenLabsVoiceId(env);
  const outputFormat = resolveElevenLabsOutputFormat(env);
  const startedAt = Date.now();

  if (!apiKey) {
    return {
      provider,
      status: 503,
      code: "ELEVENLABS_NOT_CONFIGURED",
      message: "ELEVENLABS_API_KEY não configurada.",
      requestId: null,
      latencyMs: 0,
    };
  }

  try {
    const url = new URL(`${ELEVENLABS_SPEECH_URL}/${encodeURIComponent(voice)}`);
    url.searchParams.set("output_format", outputFormat);
    const body: Record<string, unknown> = {
      text,
      model_id: model,
      voice_settings: {
        stability: 0.48,
        similarity_boost: 0.78,
        style: 0.18,
        speed: 1.03,
        use_speaker_boost: true,
      },
    };
    if (model !== "eleven_multilingual_v2") body.language_code = "pt";

    const response = await fetcher(url, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: combinedSignal(signal),
    });
    const latencyMs = Date.now() - startedAt;
    const requestId = providerRequestId(response);

    if (!response.ok) {
      return {
        provider,
        status: response.status,
        code: providerFailureCode(provider, response.status),
        message: await readProviderError(response, "ElevenLabs TTS failed"),
        requestId,
        latencyMs,
      };
    }

    const audio = await response.arrayBuffer();
    if (!audio.byteLength) {
      return {
        provider,
        status: 502,
        code: "ELEVENLABS_EMPTY_AUDIO",
        message: "ElevenLabs returned empty audio",
        requestId,
        latencyMs,
      };
    }

    return {
      ok: true,
      provider,
      model,
      voice,
      contentType: response.headers.get("content-type") || "audio/mpeg",
      audio,
      requestId,
      latencyMs,
      fallback: false,
      attempts: [],
    };
  } catch (error) {
    const aborted = signal?.aborted;
    return {
      provider,
      status: aborted ? 499 : 504,
      code: aborted ? "TTS_REQUEST_ABORTED" : "ELEVENLABS_TIMEOUT_OR_UNREACHABLE",
      message: error instanceof Error ? error.message : "ElevenLabs unreachable",
      requestId: null,
      latencyMs: Date.now() - startedAt,
    };
  }
}

async function generateWithOpenAi(
  text: string,
  requestedVoice: string | undefined,
  env: NodeJS.ProcessEnv,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): Promise<SamuelTtsGeneration | SamuelTtsAttempt> {
  const provider = "openai" as const;
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = resolveOpenAiTtsModel(env);
  const voice = resolveOpenAiTtsVoice(requestedVoice, env);
  const startedAt = Date.now();

  if (!apiKey) {
    return {
      provider,
      status: 503,
      code: "OPENAI_NOT_CONFIGURED",
      message: "OPENAI_API_KEY não configurada.",
      requestId: null,
      latencyMs: 0,
    };
  }

  try {
    const response = await fetcher(OPENAI_SPEECH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        instructions:
          "Fale em português brasileiro natural. Voz feminina adulta, fluida, calma, segura e próxima. Ritmo de conversa presencial, frases fluidas, sem tom de locutora, sem exagerar pausas e sem soar robótico. Dê ênfase natural ao significado.",
        response_format: "mp3",
        speed: 1,
      }),
      cache: "no-store",
      signal: combinedSignal(signal),
    });
    const latencyMs = Date.now() - startedAt;
    const requestId = providerRequestId(response);

    if (!response.ok) {
      return {
        provider,
        status: response.status,
        code: providerFailureCode(provider, response.status),
        message: await readProviderError(response, "OpenAI TTS failed"),
        requestId,
        latencyMs,
      };
    }

    const audio = await response.arrayBuffer();
    if (!audio.byteLength) {
      return {
        provider,
        status: 502,
        code: "OPENAI_EMPTY_AUDIO",
        message: "OpenAI returned empty audio",
        requestId,
        latencyMs,
      };
    }

    return {
      ok: true,
      provider,
      model,
      voice,
      contentType: response.headers.get("content-type") || "audio/mpeg",
      audio,
      requestId,
      latencyMs,
      fallback: false,
      attempts: [],
    };
  } catch (error) {
    const aborted = signal?.aborted;
    return {
      provider,
      status: aborted ? 499 : 504,
      code: aborted ? "TTS_REQUEST_ABORTED" : "OPENAI_TIMEOUT_OR_UNREACHABLE",
      message: error instanceof Error ? error.message : "OpenAI unreachable",
      requestId: null,
      latencyMs: Date.now() - startedAt,
    };
  }
}

export async function generateSamuelSpeech(input: {
  text: string;
  requestedProvider?: SamuelTtsProvider;
  requestedOpenAiVoice?: string;
  requestedElevenLabsVoiceId?: string;
  env?: NodeJS.ProcessEnv;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
}): Promise<SamuelTtsGeneration> {
  const env = input.env ?? process.env;
  const fetcher = input.fetcher ?? fetch;
  const readiness = ttsProviderReadiness(env);
  const attempts: SamuelTtsAttempt[] = [];
  const providerOrder = input.requestedProvider
    ? readiness.order.filter((provider) => provider === input.requestedProvider)
    : [...readiness.order];

  if (!providerOrder.length) {
    return { ok: false, status: 503, code: "TTS_NOT_CONFIGURED", attempts };
  }

  for (const provider of providerOrder) {
    const result = provider === "elevenlabs"
      ? await generateWithElevenLabs(
          input.text,
          input.requestedElevenLabsVoiceId,
          env,
          fetcher,
          input.signal,
        )
      : await generateWithOpenAi(
          input.text,
          input.requestedOpenAiVoice,
          env,
          fetcher,
          input.signal,
        );

    if ("ok" in result && result.ok) {
      return {
        ...result,
        fallback: attempts.length > 0,
        attempts,
      };
    }

    attempts.push(result as SamuelTtsAttempt);
    if (input.signal?.aborted) break;
  }

  const onlyAttempt = attempts.length === 1 ? attempts[0] : null;
  return {
    ok: false,
    status: onlyAttempt?.status === 429 ? 429 : onlyAttempt?.status === 499 ? 499 : 503,
    code:
      onlyAttempt?.status === 429
        ? "TTS_RATE_LIMITED"
        : onlyAttempt?.status === 499
          ? "TTS_REQUEST_ABORTED"
          : "TTS_PROVIDERS_UNAVAILABLE",
    attempts,
  };
}
