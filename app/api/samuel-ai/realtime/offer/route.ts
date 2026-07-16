import { createHash } from "node:crypto";

import {
  buildRealtimeSession,
  DEFAULT_REALTIME_VOICE,
  InvalidRealtimeModelError,
  resolveRealtimeModel,
} from "@/features/samuel-ai/realtime/samuel-realtime.server";
import { getWorkspaceSessionIdentity } from "@/features/samuel-ai/server/workspace-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SDP_BYTES = 96_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;

const buckets = new Map<string, { count: number; resetAt: number }>();

function jsonError(message: string, status: number, code: string) {
  return Response.json({ error: message, code }, { status });
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

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function requestIdentity(request: Request, sessionHash: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  return hashIdentifier(`samuel-realtime:${sessionHash}:${vercelIp || forwardedFor || "unknown"}`);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Voz Realtime indisponível: OPENAI_API_KEY não está configurada no servidor.",
      503,
      "REALTIME_NOT_CONFIGURED",
    );
  }

  let model: string;
  try {
    model = resolveRealtimeModel();
  } catch (error) {
    if (error instanceof InvalidRealtimeModelError) {
      return jsonError(
        "O modelo configurado para voz não é compatível com a API Realtime.",
        400,
        error.code,
      );
    }
    throw error;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/sdp")) {
    return jsonError(
      "Envie uma oferta SDP com Content-Type application/sdp.",
      415,
      "SDP_CONTENT_TYPE_INVALID",
    );
  }

  const companyId = request.headers.get("x-samuel-company-id")?.trim() ?? "";
  if (!companyId || companyId.length > 160) {
    return jsonError("Empresa inválida para voz Realtime.", 400, "COMPANY_INVALID");
  }

  const contextSummary =
    request.headers.get("x-samuel-context-summary")?.slice(0, 600) ?? null;
  const { sessionHash } = await getWorkspaceSessionIdentity();
  const rateKey = requestIdentity(request, sessionHash);
  if (rateLimit(rateKey)) {
    return jsonError(
      "Limite de sessões de voz atingido. Tente novamente em instantes.",
      429,
      "REALTIME_RATE_LIMITED",
    );
  }

  const sdp = await request.text();
  if (!sdp || sdp.length > MAX_SDP_BYTES || !sdp.includes("v=0")) {
    return jsonError("Oferta SDP inválida.", 400, "SDP_INVALID");
  }

  // Keep Samuel's identity stable across deployments. A legacy Vercel value
  // must not silently switch him back to a different vocal identity.
  const session = buildRealtimeSession({
    model,
    voice: DEFAULT_REALTIME_VOICE,
    contextSummary,
  });
  const formData = new FormData();
  formData.set("sdp", sdp);
  formData.set("session", JSON.stringify(session));

  let openAiResponse: Response;
  try {
    openAiResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Safety-Identifier": rateKey,
      },
      body: formData,
    });
  } catch {
    return jsonError(
      "O serviço de voz está temporariamente indisponível.",
      502,
      "REALTIME_PROVIDER_UNREACHABLE",
    );
  }

  const responseText = await openAiResponse.text();
  if (!openAiResponse.ok) {
    const unauthorized = openAiResponse.status === 401 || openAiResponse.status === 403;
    console.error("Realtime provider rejected session", {
      status: openAiResponse.status,
      requestId: openAiResponse.headers.get("x-request-id"),
    });

    return jsonError(
      unauthorized
        ? "Voz Realtime não autorizada no provedor. Verifique a chave do servidor."
        : "Não foi possível iniciar a sessão de voz Realtime.",
      unauthorized ? 503 : 502,
      unauthorized ? "REALTIME_PROVIDER_UNAUTHORIZED" : "REALTIME_PROVIDER_ERROR",
    );
  }

  return new Response(responseText, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/sdp",
    },
  });
}
