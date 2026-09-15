import { createConfiguredResponsesProvider } from "@/apps/web/src/core/orchestrator/openai-responses.provider";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { elevenVideoReadiness } from "@/features/samuel-ai/content-studio/elevenlabs-video.server";
import {
  generateContentProject,
  validateContentRequest,
} from "@/features/samuel-ai/content-studio/samuel-content.server";
import type { ContentReadiness } from "@/features/samuel-ai/content-studio/samuel-content.types";
import { ttsProviderReadiness } from "@/features/samuel-ai/voice/samuel-tts-gateway";
import { resolveMetaClientConfigForCompany } from "@/integrations/meta/meta.auth";
import { findMetaOAuthConnection } from "@/integrations/meta/meta-token.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function grantedScopes(value: string | null | undefined) {
  return new Set((value ?? "").split(/[\s,]+/).map((item) => item.trim()).filter(Boolean));
}

async function readiness(companyId: string): Promise<ContentReadiness> {
  const tts = ttsProviderReadiness();
  const aiVideo = elevenVideoReadiness();
  const [meta, metaConnection] = await Promise.all([
    resolveMetaClientConfigForCompany(companyId),
    findMetaOAuthConnection(companyId).catch(() => null),
  ]);
  const scopes = grantedScopes(metaConnection?.scopes);
  const metaSelected = Boolean(metaConnection?.selectedExplicitly);
  const facebookReady = Boolean(
    metaSelected && meta?.accessToken && meta.pageId && scopes.has("pages_manage_posts"),
  );
  const instagramReady = Boolean(
    metaSelected &&
    meta?.accessToken &&
    meta.instagramBusinessId &&
    scopes.has("instagram_content_publish"),
  );
  const linkedInOrgId = process.env.LINKEDIN_ORGANIZATION_ID || process.env.LINKEDIN_ORG_ID;
  const publishing = {
    facebook: {
      ready: facebookReady,
      detail: facebookReady
        ? "Página selecionada e pages_manage_posts concedido. Publicação com verificação de ID disponível."
        : "Exige Página selecionada e permissão pages_manage_posts concedida pela Meta.",
    },
    instagram: {
      ready: instagramReady,
      detail: instagramReady
        ? "Instagram profissional selecionado e instagram_content_publish concedido. Reels podem ser publicados e verificados."
        : "Exige Instagram profissional ligado à Página e instagram_content_publish concedido pela Meta.",
    },
    youtube: {
      ready: Boolean(process.env.YOUTUBE_ACCESS_TOKEN),
      detail: "Exige OAuth com youtube.upload e um publicador dedicado; não é tratado como publicado sem confirmação da API.",
    },
    tiktok: {
      ready: Boolean(process.env.TIKTOK_ACCESS_TOKEN),
      detail: "Exige Content Posting API, escopo video.publish e auditoria TikTok.",
    },
    linkedin: {
      ready: Boolean(process.env.LINKEDIN_ACCESS_TOKEN && linkedInOrgId),
      detail: "Exige acesso de administrador e permissões de publicação da organização.",
    },
  };
  return {
    generation: {
      ready: Boolean(createConfiguredResponsesProvider()),
      detail: "AI Gateway cria estratégia, roteiro, cenas e textos; há um gerador-base quando indisponível.",
    },
    narration: {
      ready: tts.order.length > 0,
      provider: tts.order[0] ?? "indisponível",
      detail: tts.elevenlabs.configured
        ? "ElevenLabs conectada no servidor para narração natural."
        : "Configure ELEVENLABS_API_KEY para narração ElevenLabs.",
    },
    aiVideo: {
      ready: aiVideo.configured,
      provider: aiVideo.provider,
      model: aiVideo.model,
      detail: aiVideo.detail,
    },
    browserRenderer: {
      ready: true,
      detail: "Monta campanha completa no navegador; prefere MP4/H.264 quando o navegador suporta e mantém WebM somente como fallback de prévia.",
    },
    publishing,
  };
}

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  return Response.json({ readiness: await readiness(companyId) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const companyId = typeof body?.companyId === "string" ? body.companyId.trim() : "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  try {
    const input = validateContentRequest(body);
    const generated = await generateContentProject(input);
    return Response.json({ ...generated, readiness: await readiness(companyId) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Não foi possível criar a campanha." },
      { status: 400 },
    );
  }
}
