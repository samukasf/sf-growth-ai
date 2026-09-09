import {
  liveProviderReadiness,
  resolveGeminiLiveModel,
  resolveSamuelLiveProvider,
} from "@/apps/web/src/core/orchestrator/live-provider.server";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

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

export async function GET(request: Request) {
  const companyId = request.headers.get("x-samuel-company-id")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const preferredProvider = resolveSamuelLiveProvider();
  const readiness = liveProviderReadiness();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const shouldProbe = new URL(request.url).searchParams.get("probe") === "1";
  const geminiProbe = shouldProbe && geminiKey ? await probeGeminiToken(geminiKey) : null;

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
    fallback: {
      capture: "MediaRecorder",
      transcriptionOrder: ["gemini", "openai"],
      browserTts: true,
    },
    serverTime: new Date().toISOString(),
  }, { headers: { "cache-control": "no-store" } });
}
