import { createConfiguredResponsesProvider } from "@/apps/web/src/core/orchestrator/openai-responses.provider";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { elevenVideoReadiness } from "@/features/samuel-ai/content-studio/elevenlabs-video.server";
import { falVideoReadiness } from "@/features/samuel-ai/content-studio/fal-video.server";
import { runwayVideoReadiness } from "@/features/samuel-ai/content-studio/runway-video.server";
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
  const elevenVideo = elevenVideoReadiness();
  const runwayVideo = runwayVideoReadiness();
  const falVideo = falVideoReadiness();
  const [meta, metaConnection] = await Promise.all([
    resolveMetaClientConfigForCompany(companyId),
    findMetaOAuthConnection(companyId).catch(() => null),
  ]);
  const scopes = grantedScopes(metaConnection?.scopes);
  const metaSelected = Boolean(metaConnection?.selectedExplicitly);
  const facebookReady = Boolean(metaSelected && meta?.accessToken && meta.pageId && scopes.has("pages_manage_posts"));
  const instagramReady = Boolean(metaSelected && meta?.accessToken && meta.instagramBusinessId && scopes.has("instagram_content_publish"));
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

  const externalVideoReady = runwayVideo.configured || falVideo.configured || elevenVideo.configured;
  const preferred = runwayVideo.configured
    ? runwayVideo
    : falVideo.configured
      ? falVideo
      : elevenVideo;
  const externalDetail = runwayVideo.configured
    ? `${runwayVideo.detail} O modo profissional usa múltiplos takes, áudio nativo quando disponível e uma imagem inicial como âncora.`
    : falVideo.configured
      ? `${falVideo.detail} Fotos podem gerar movimento real; com vídeo de referência o pipeline também suporta transferência de movimento.`
      : elevenVideo.configured
        ? `${elevenVideo.detail} Para cenas completas e múltiplos takes, configure Runway ou FAL_KEY.`
        : "Nenhum provedor generativo está configurado. O renderizador Samuel local continua disponível, mas apenas monta fotos, textos e narração; ele não substitui um modelo generativo de vídeo.";

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
      ready: externalVideoReady,
      provider: externalVideoReady ? `${preferred.provider} · ${preferred.model}` : "Renderizador Samuel",
      model: preferred.model,
      detail: externalDetail,
    },
    browserRenderer: {
      ready: true,
      detail: "Fallback local: monta narração e referências com pan/zoom e composição. Para movimento corporal, troca real de cenário/roupa e novos takes, use o modo Vídeo IA Profissional.",
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
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível criar a campanha." }, { status: 400 });
  }
}
