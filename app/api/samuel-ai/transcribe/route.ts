import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 12 * 1024 * 1024;
const TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

function jsonError(message: string, status: number, code: string) {
  return Response.json({ error: message, code }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return jsonError(
      "Transcrição de voz indisponível: OPENAI_API_KEY não configurada.",
      503,
      "VOICE_TRANSCRIPTION_NOT_CONFIGURED",
    );
  }

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

  const providerForm = new FormData();
  providerForm.set("file", audio, audio.name || "samuel-voice.webm");
  providerForm.set("model", TRANSCRIPTION_MODEL);
  providerForm.set("language", "pt");

  let providerResponse: Response;
  try {
    providerResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: providerForm,
      cache: "no-store",
    });
  } catch {
    return jsonError(
      "O serviço de transcrição está temporariamente indisponível.",
      502,
      "VOICE_TRANSCRIPTION_UNREACHABLE",
    );
  }

  const payload = (await providerResponse.json().catch(() => null)) as
    | { text?: string; error?: { message?: string } }
    | null;

  if (!providerResponse.ok) {
    console.error("Samuel voice transcription failed", {
      status: providerResponse.status,
      requestId: providerResponse.headers.get("x-request-id"),
      providerMessage: payload?.error?.message,
    });
    return jsonError(
      "Não foi possível transcrever o áudio.",
      providerResponse.status === 429 ? 429 : 502,
      providerResponse.status === 429
        ? "VOICE_TRANSCRIPTION_RATE_LIMITED"
        : "VOICE_TRANSCRIPTION_PROVIDER_ERROR",
    );
  }

  const text = payload?.text?.trim();
  if (!text) {
    return jsonError("Não consegui identificar fala no áudio.", 422, "VOICE_NO_SPEECH");
  }

  return Response.json(
    { ok: true, text, model: TRANSCRIPTION_MODEL },
    { headers: { "cache-control": "no-store" } },
  );
}
