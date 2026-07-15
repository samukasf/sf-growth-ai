import { createHash } from "node:crypto";

import { getWorkspaceSessionIdentity } from "@/features/samuel-ai/server/workspace-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime-2.1";
const REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE ?? "marin";
const MAX_SDP_BYTES = 96_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;

const buckets = new Map<string, { count: number; resetAt: number }>();

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function rateLimit(key: string) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function safetyIdentifier(sessionHash: string, companyId: string) {
  return createHash("sha256")
    .update(`samuel-realtime:${sessionHash}:${companyId}`)
    .digest("hex");
}

function buildSessionConfig(input: { companyId: string; contextSummary: string | null }) {
  const context = input.contextSummary
    ? `\n\nContexto executivo disponível: ${input.contextSummary}`
    : "";

  return {
    type: "realtime",
    model: REALTIME_MODEL,
    instructions: `Você é Samuel AI, o executivo de crescimento do SF Growth AI. Responda em português brasileiro por padrão, adapte-se ao idioma do usuário e seja objetivo, consultivo e profissional. Use o contexto empresarial apenas quando for relevante. Nunca revele segredos, chaves ou detalhes internos de infraestrutura.${context}`,
    audio: {
      output: {
        voice: REALTIME_VOICE,
      },
    },
    input_audio_transcription: {
      model: "gpt-realtime-transcribe",
    },
    turn_detection: null,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Voz Realtime indisponível: OPENAI_API_KEY não está configurada no servidor.",
      503,
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/sdp")) {
    return jsonError("Envie uma oferta SDP com Content-Type application/sdp.", 415);
  }

  const companyId = request.headers.get("x-samuel-company-id")?.trim() ?? "";
  if (!companyId || companyId.length > 160) {
    return jsonError("Empresa inválida para voz Realtime.", 400);
  }

  const contextSummary =
    request.headers.get("x-samuel-context-summary")?.slice(0, 600) ?? null;
  const { sessionHash } = await getWorkspaceSessionIdentity();
  const rateKey = safetyIdentifier(sessionHash, companyId);
  if (rateLimit(rateKey)) {
    return jsonError("Limite de sessões de voz atingido. Tente novamente em instantes.", 429);
  }

  const sdp = await request.text();
  if (!sdp || sdp.length > MAX_SDP_BYTES || !sdp.includes("v=0")) {
    return jsonError("Oferta SDP inválida.", 400);
  }

  const formData = new FormData();
  formData.set("sdp", sdp);
  formData.set("session", JSON.stringify(buildSessionConfig({ companyId, contextSummary })));

  const openAiResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Safety-Identifier": rateKey,
    },
    body: formData,
  });

  const responseText = await openAiResponse.text();
  if (!openAiResponse.ok) {
    return jsonError(
      openAiResponse.status === 401 || openAiResponse.status === 403
        ? "Voz Realtime não autorizada no provedor. Verifique a chave do servidor."
        : "Não foi possível iniciar a sessão de voz Realtime.",
      openAiResponse.status,
    );
  }

  return new Response(responseText, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/sdp",
    },
  });
}
