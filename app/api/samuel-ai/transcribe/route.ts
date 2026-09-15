import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const ELEVENLABS_TRANSCRIPTION_MODEL =
  process.env.ELEVENLABS_TRANSCRIPTION_MODEL?.trim() || "scribe_v2";
const OPENAI_TRANSCRIPTION_MODEL =
  process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || "gpt-4o-mini-transcribe";
const GEMINI_TRANSCRIPTION_MODEL =
  process.env.GEMINI_TRANSCRIPTION_MODEL?.trim() || "gemini-3.6-flash";
const GEMINI_FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

type ProviderResult = {
  ok: boolean;
  text?: string;
  provider?: "elevenlabs" | "openai" | "gemini";
  model?: string;
  status?: number;
  error?: string;
  code?: string;
};

type GeminiGeneratePayload = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
};

type GeminiModelListPayload = {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
    supportedActions?: string[];
  }>;
};

function jsonError(message: string, status: number, code: string) {
  return Response.json({ error: message, code }, { status });
}

function resolveGeminiApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null
  );
}

function normalizeGeminiModelName(name: string) {
  return name.trim().replace(/^models\//, "");
}

function uniqueGeminiModels(models: string[]) {
  return [...new Set(models.map(normalizeGeminiModelName).filter(Boolean))];
}

async function discoverGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?pageSize=100",
      {
        headers: { "x-goog-api-key": apiKey },
        cache: "no-store",
      },
    );
    if (!response.ok) return [];

    const payload = (await response.json().catch(() => null)) as GeminiModelListPayload | null;
    const supported = (payload?.models ?? [])
      .filter((model) => {
        const methods = [
          ...(model.supportedGenerationMethods ?? []),
          ...(model.supportedActions ?? []),
        ];
        return methods.includes("generateContent");
      })
      .map((model) => normalizeGeminiModelName(model.name ?? ""))
      .filter((name) => name.startsWith("gemini-"));

    return supported.sort((left, right) => {
      const leftFlash = left.includes("flash") ? 1 : 0;
      const rightFlash = right.includes("flash") ? 1 : 0;
      return rightFlash - leftFlash;
    });
  } catch {
    return [];
  }
}

async function requestGeminiTranscription(input: {
  apiKey: string;
  model: string;
  bytes: Buffer;
  mimeType: string;
}): Promise<ProviderResult> {
  const model = normalizeGeminiModelName(input.model);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Transcreva exatamente a fala deste áudio em português. Retorne somente a transcrição, sem explicações, aspas ou comentários.",
            },
            {
              inline_data: {
                mime_type: input.mimeType,
                data: input.bytes.toString("base64"),
              },
            },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 2048, temperature: 0 },
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as GeminiGeneratePayload | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      code: response.status === 429 ? "GEMINI_RATE_LIMITED" : "GEMINI_PROVIDER_ERROR",
      error: payload?.error?.message || "Gemini transcription failed",
      model,
    };
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    return {
      ok: false,
      status: 422,
      code: "GEMINI_NO_SPEECH",
      error: "No speech detected",
      model,
    };
  }

  return {
    ok: true,
    text,
    provider: "gemini",
    model,
  };
}

export async function transcribeWithElevenLabs(audio: File): Promise<ProviderResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      code: "ELEVENLABS_NOT_CONFIGURED",
      error: "ELEVENLABS_API_KEY não configurada.",
    };
  }

  const providerForm = new FormData();
  providerForm.set("file", audio, audio.name || "samuel-voice.wav");
  providerForm.set("model_id", ELEVENLABS_TRANSCRIPTION_MODEL);
  providerForm.set("language_code", "por");
  providerForm.set("tag_audio_events", "false");
  providerForm.set("timestamps_granularity", "none");

  const startedAt = Date.now();
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: providerForm,
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | { text?: string; detail?: { message?: string }; message?: string }
      | null;

    if (!response.ok) {
      console.warn("Samuel ElevenLabs transcription unavailable", {
        status: response.status,
        requestId: response.headers.get("request-id"),
        providerMessage: payload?.detail?.message ?? payload?.message,
        latencyMs: Date.now() - startedAt,
      });
      return {
        ok: false,
        status: response.status,
        code:
          response.status === 429
            ? "ELEVENLABS_RATE_LIMITED"
            : "ELEVENLABS_PROVIDER_ERROR",
        error:
          payload?.detail?.message ??
          payload?.message ??
          "ElevenLabs transcription failed",
      };
    }

    const text = payload?.text?.trim();
    if (!text) {
      return {
        ok: false,
        status: 422,
        code: "ELEVENLABS_NO_SPEECH",
        error: "No speech detected",
      };
    }

    return {
      ok: true,
      text,
      provider: "elevenlabs",
      model: ELEVENLABS_TRANSCRIPTION_MODEL,
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      code: "ELEVENLABS_UNREACHABLE",
      error: error instanceof Error ? error.message : "ElevenLabs unreachable",
    };
  }
}

async function transcribeWithOpenAI(audio: File): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      code: "OPENAI_NOT_CONFIGURED",
      error: "OPENAI_API_KEY não configurada.",
    };
  }

  const providerForm = new FormData();
  providerForm.set("file", audio, audio.name || "samuel-voice.wav");
  providerForm.set("model", OPENAI_TRANSCRIPTION_MODEL);
  providerForm.set("language", "pt");

  const startedAt = Date.now();
  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: providerForm,
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | { text?: string; error?: { message?: string } }
      | null;

    if (!response.ok) {
      console.warn("Samuel OpenAI transcription unavailable", {
        status: response.status,
        requestId: response.headers.get("x-request-id"),
        providerMessage: payload?.error?.message,
        latencyMs: Date.now() - startedAt,
      });
      return {
        ok: false,
        status: response.status,
        code: response.status === 429 ? "OPENAI_RATE_LIMITED" : "OPENAI_PROVIDER_ERROR",
        error: payload?.error?.message || "OpenAI transcription failed",
      };
    }

    const text = payload?.text?.trim();
    if (!text) {
      return { ok: false, status: 422, code: "OPENAI_NO_SPEECH", error: "No speech detected" };
    }

    return {
      ok: true,
      text,
      provider: "openai",
      model: OPENAI_TRANSCRIPTION_MODEL,
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      code: "OPENAI_UNREACHABLE",
      error: error instanceof Error ? error.message : "OpenAI unreachable",
    };
  }
}

async function transcribeWithGemini(audio: File): Promise<ProviderResult> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      code: "GEMINI_NOT_CONFIGURED",
      error: "GEMINI_API_KEY não configurada.",
    };
  }

  try {
    const bytes = Buffer.from(await audio.arrayBuffer());
    const mimeType = audio.type?.trim() || "audio/wav";
    const configuredModel = normalizeGeminiModelName(GEMINI_TRANSCRIPTION_MODEL);

    const first = await requestGeminiTranscription({
      apiKey,
      model: configuredModel,
      bytes,
      mimeType,
    });
    if (first.ok || first.status !== 404) return first;

    const discoveredModels = await discoverGeminiModels(apiKey);
    const candidates = uniqueGeminiModels([
      ...GEMINI_FALLBACK_MODELS,
      ...discoveredModels,
    ]).filter((model) => model !== configuredModel);

    let last = first;
    for (const model of candidates) {
      const attempt = await requestGeminiTranscription({ apiKey, model, bytes, mimeType });
      if (attempt.ok) {
        console.info("Samuel Gemini transcription recovered with available model", {
          configuredModel,
          selectedModel: attempt.model,
        });
        return attempt;
      }
      last = attempt;
      if (attempt.status !== 404) return attempt;
    }

    return last;
  } catch (error) {
    return {
      ok: false,
      status: 502,
      code: "GEMINI_UNREACHABLE",
      error: error instanceof Error ? error.message : "Gemini unreachable",
    };
  }
}

export async function POST(request: Request) {
  const companyId = request.headers.get("x-samuel-company-id")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Áudio inválido para transcrição.", 400, "VOICE_AUDIO_INVALID");
  }

  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return jsonError("Nenhum áudio foi recebido.", 400, "VOICE_AUDIO_MISSING");
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return jsonError("O áudio excedeu o limite desta conversa.", 413, "VOICE_AUDIO_TOO_LARGE");
  }

  const elevenlabs = await transcribeWithElevenLabs(audio);
  if (elevenlabs.ok && elevenlabs.text) {
    return Response.json(
      {
        ok: true,
        text: elevenlabs.text,
        provider: elevenlabs.provider,
        model: elevenlabs.model,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const openai = await transcribeWithOpenAI(audio);
  if (openai.ok && openai.text) {
    return Response.json(
      { ok: true, text: openai.text, provider: openai.provider, model: openai.model },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const gemini = await transcribeWithGemini(audio);
  if (gemini.ok && gemini.text) {
    console.info("Samuel voice transcription used Gemini failover", {
      openaiStatus: openai.status,
      openaiCode: openai.code,
      model: gemini.model,
    });
    return Response.json(
      { ok: true, text: gemini.text, provider: gemini.provider, model: gemini.model, fallback: true },
      { headers: { "cache-control": "no-store" } },
    );
  }

  console.error("Samuel voice transcription exhausted providers", {
    elevenlabsStatus: elevenlabs.status,
    elevenlabsCode: elevenlabs.code,
    openaiStatus: openai.status,
    openaiCode: openai.code,
    geminiStatus: gemini.status,
    geminiCode: gemini.code,
    geminiModel: gemini.model,
  });

  if (
    elevenlabs.code?.includes("NO_SPEECH") ||
    openai.code?.includes("NO_SPEECH") ||
    gemini.code?.includes("NO_SPEECH")
  ) {
    return jsonError("Não consegui identificar fala no áudio.", 422, "VOICE_NO_SPEECH");
  }

  return jsonError(
    "A transcrição de voz está temporariamente indisponível nos provedores configurados.",
    503,
    "VOICE_TRANSCRIPTION_PROVIDERS_UNAVAILABLE",
  );
}
