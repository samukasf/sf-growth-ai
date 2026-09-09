import { createHash } from "node:crypto";

import {
  liveProviderReadiness,
  resolveGeminiLiveModel,
  resolveSamuelLiveProvider,
} from "@/apps/web/src/core/orchestrator/live-provider.server";
import { getWorkspaceSessionIdentity } from "@/features/samuel-ai/server/workspace-session";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_TTL_MS = 30 * 60_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 8;
const buckets = new Map<string, { count: number; resetAt: number }>();

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function rateLimited(key: string) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

function jsonError(message: string, status: number, code: string) {
  return Response.json({ error: message, code }, { status });
}

async function createGeminiToken(apiKey: string, body: Record<string, unknown>) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | { name?: string; error?: { code?: number; status?: string; message?: string } }
    | null;
  return { response, payload };
}

function openAiBootstrap(fallback: boolean) {
  return Response.json({
    provider: "openai",
    configured: true,
    fallback,
    model: process.env.OPENAI_REALTIME_MODEL?.trim() || "gpt-realtime-2.1",
  }, { headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request) {
  const companyId = request.headers.get("x-samuel-company-id")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  let provider: "openai" | "gemini";
  const requestedProvider = new URL(request.url).searchParams.get("provider")?.trim().toLowerCase();
  try {
    provider = requestedProvider === "openai" || requestedProvider === "gemini"
      ? requestedProvider
      : resolveSamuelLiveProvider();
  } catch {
    return jsonError("Configuração do provedor Live inválida.", 500, "LIVE_PROVIDER_INVALID");
  }

  const configuredProvider = resolveSamuelLiveProvider();
  const readiness = provider === configuredProvider
    ? liveProviderReadiness()
    : provider === "gemini"
      ? {
          provider,
          configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
          model: resolveGeminiLiveModel(),
          missingKey: process.env.GEMINI_API_KEY?.trim() ? null : "GEMINI_API_KEY",
        }
      : {
          provider,
          configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
          model: process.env.OPENAI_REALTIME_MODEL?.trim() || "gpt-realtime-2.1",
          missingKey: process.env.OPENAI_API_KEY?.trim() ? null : "OPENAI_API_KEY",
        };

  if (!readiness.configured) {
    const alternateAvailable = provider === "gemini"
      ? Boolean(process.env.OPENAI_API_KEY?.trim())
      : Boolean(process.env.GEMINI_API_KEY?.trim());

    if (!requestedProvider && alternateAvailable) {
      if (provider === "gemini") return openAiBootstrap(true);
      provider = "gemini";
    } else {
      return jsonError(
        `Voz Live indisponível: ${readiness.missingKey ?? "chave do provedor"} não configurada.`,
        503,
        "LIVE_NOT_CONFIGURED",
      );
    }
  }

  if (provider === "openai") {
    return openAiBootstrap(Boolean(requestedProvider));
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return jsonError("Gemini Live não configurado.", 503, "GEMINI_NOT_CONFIGURED");

  const { sessionHash } = await getWorkspaceSessionIdentity();
  if (rateLimited(digest(`${sessionHash}:${companyId}`))) {
    return jsonError("Limite de sessões Live atingido.", 429, "LIVE_RATE_LIMITED");
  }

  const now = Date.now();
  const model = resolveGeminiLiveModel();

  let tokenAttempt = await createGeminiToken(apiKey, { uses: 1 });
  if (!tokenAttempt.response.ok && tokenAttempt.response.status === 400) {
    tokenAttempt = await createGeminiToken(apiKey, {});
  }

  if (!tokenAttempt.response.ok || !tokenAttempt.payload?.name) {
    console.error("Gemini ephemeral token provisioning failed", {
      status: tokenAttempt.response.status,
      googleStatus: tokenAttempt.payload?.error?.status,
      googleMessage: tokenAttempt.payload?.error?.message,
      model,
    });

    if (!requestedProvider && process.env.OPENAI_API_KEY?.trim()) {
      return openAiBootstrap(true);
    }

    return jsonError("Não foi possível iniciar a sessão Gemini Live.", 502, "GEMINI_TOKEN_ERROR");
  }

  return Response.json({
    provider: "gemini",
    configured: true,
    fallback: Boolean(requestedProvider),
    model,
    token: tokenAttempt.payload.name,
    websocketUrl: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(tokenAttempt.payload.name)}`,
    expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(),
  }, { headers: { "cache-control": "no-store" } });
}
