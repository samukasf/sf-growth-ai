import { createConfiguredResponsesProvider } from "@/apps/web/src/core/orchestrator/openai-responses.provider";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  generateContentProject,
  validateContentRequest,
} from "@/features/samuel-ai/content-studio/samuel-content.server";
import type { ContentReadiness } from "@/features/samuel-ai/content-studio/samuel-content.types";
import { ttsProviderReadiness } from "@/features/samuel-ai/voice/samuel-tts-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readiness(): ContentReadiness {
  const tts = ttsProviderReadiness();
  const publishing = {
    facebook: { ready: Boolean(process.env.META_PAGE_ACCESS_TOKEN && process.env.META_PAGE_ID), detail: "Exige Página Meta conectada com pages_manage_posts." },
    instagram: { ready: Boolean(process.env.META_PAGE_ACCESS_TOKEN && process.env.META_INSTAGRAM_BUSINESS_ID), detail: "Exige conta profissional do Instagram vinculada à Página." },
    youtube: { ready: Boolean(process.env.YOUTUBE_ACCESS_TOKEN), detail: "Exige OAuth com youtube.upload e aprovação do projeto Google." },
    tiktok: { ready: Boolean(process.env.TIKTOK_ACCESS_TOKEN), detail: "Exige Content Posting API, escopo video.publish e auditoria TikTok." },
    linkedin: { ready: Boolean(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_ORGANIZATION_ID), detail: "Exige acesso de administrador e permissões de publicação da organização." },
  };
  return {
    generation: { ready: Boolean(createConfiguredResponsesProvider()), detail: "AI Gateway cria roteiro, cenas e textos; há um gerador-base quando indisponível." },
    narration: { ready: tts.order.length > 0, provider: tts.order[0] ?? "indisponível", detail: tts.elevenlabs.configured ? "ElevenLabs conectada no servidor." : "Configure ELEVENLABS_API_KEY para narração ElevenLabs." },
    browserRenderer: { ready: true, detail: "Monta vídeo vertical WebM com animação e narração no navegador." },
    publishing,
  };
}

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  return Response.json({ readiness: readiness() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const companyId = typeof body?.companyId === "string" ? body.companyId.trim() : "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  try {
    const input = validateContentRequest(body);
    const generated = await generateContentProject(input);
    return Response.json({ ...generated, readiness: readiness() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível criar a campanha." }, { status: 400 });
  }
}
