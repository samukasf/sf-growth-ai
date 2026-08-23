import { createHash } from "node:crypto";

import {
  liveProviderReadiness,
  resolveGeminiLiveModel,
  resolveSamuelLiveProvider,
} from "@/apps/web/src/core/orchestrator/live-provider.server";
import { getWorkspaceSessionIdentity } from "@/features/samuel-ai/server/workspace-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_TTL_MS = 30 * 60_000;
const NEW_SESSION_TTL_MS = 60_000;
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

export async function GET(request: Request) {
  let provider: "openai" | "gemini";
  try {
    provider = resolveSamuelLiveProvider();
  } catch {
    return jsonError("Configuração do provedor Live inválida.", 500, "LIVE_PROVIDER_INVALID");
  }

  const readiness = liveProviderReadiness();
  if (!readiness.configured) {
    if (provider === "gemini" && process.env.OPENAI_API_KEY?.trim()) {
      return Response.json({
        provider: "openai",
        configured: true,
        fallback: true,
        model: process.env.OPENAI_REALTIME_MODEL?.trim() || "gpt-realtime-2.1",
      });
    }
    return jsonError(
      `Voz Live indisponível: ${readiness.missingKey ?? "chave do provedor"} não configurada.`,
      503,
      "LIVE_NOT_CONFIGURED",
    );
  }

  if (provider === "openai") {
    return Response.json({
      provider: "openai",
      configured: true,
      fallback: false,
      model: readiness.model,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return jsonError("Gemini Live não configurado.", 503, "GEMINI_NOT_CONFIGURED");

  const companyId = request.headers.get("x-samuel-company-id")?.trim() || "default-company";
  const { sessionHash } = await getWorkspaceSessionIdentity();
  if (rateLimited(digest(`${sessionHash}:${companyId}`))) {
    return jsonError("Limite de sessões Live atingido.", 429, "LIVE_RATE_LIMITED");
  }

  const now = Date.now();
  const model = resolveGeminiLiveModel();
  const tokenResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(now + TOKEN_TTL_MS).toISOString(),
      newSessionExpireTime: new Date(now + NEW_SESSION_TTL_MS).toISOString(),
      liveConnectConstraints: {
        model: `models/${model}`,
        config: {
          responseModalities: ["AUDIO"],
          sessionResumption: {},
        },
      },
    }),
  });

  const payload = (await tokenResponse.json().catch(() => null)) as { name?: string } | null;
  if (!tokenResponse.ok || !payload?.name) {
    console.error("Gemini ephemeral token provisioning failed", { status: tokenResponse.status });
    return jsonError("Não foi possível iniciar a sessão Gemini Live.", 502, "GEMINI_TOKEN_ERROR");
  }

  return Response.json({
    provider: "gemini",
    configured: true,
    fallback: false,
    model,
    token: payload.name,
    websocketUrl: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(payload.name)}`,
    expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(),
  }, { headers: { "cache-control": "no-store" } });
}
