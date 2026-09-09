import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const OPENAI_TRANSCRIPTION_MODEL =
  process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || "gpt-4o-mini-transcribe";
const GEMINI_TRANSCRIPTION_MODEL =
  process.env.GEMINI_TRANSCRIPTION_MODEL?.trim() || "gemini-2.5-flash";

type ProviderResult = {
  ok: boolean;
  text?: string;
  provider?: "openai" | "gemini";
  model?: string;
  status?: number;
  error?: string;
  code?: string;
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_TRANSCRIPTION_MODEL)}:generateContent`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
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
                  mime_type: mimeType,
                  data: bytes.toString("base64"),
                },
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 2048, temperature: 0 },
      }),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
          error?: { message?: string };
        }
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        code: response.status === 429 ? "GEMINI_RATE_LIMITED" : "GEMINI_PROVIDER_ERROR",
        error: payload?.error?.message || "Gemini transcription failed",
      };
    }

    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      return { ok: false, status: 422, code: "GEMINI_NO_SPEECH", error: "No speech detected" };
    }

    return {
      ok: true,
      text,
      provider: "gemini",
      model: GEMINI_TRANSCRIPTION_MODEL,
    };
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
    openaiStatus: openai.status,
    openaiCode: openai.code,
    geminiStatus: gemini.status,
    geminiCode: gemini.code,
  });

  if (openai.code?.includes("NO_SPEECH") || gemini.code?.includes("NO_SPEECH")) {
    return jsonError("Não consegui identificar fala no áudio.", 422, "VOICE_NO_SPEECH");
  }

  return jsonError(
    "A transcrição de voz está temporariamente indisponível nos provedores configurados.",
    503,
    "VOICE_TRANSCRIPTION_PROVIDERS_UNAVAILABLE",
  );
}
