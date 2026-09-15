import "server-only";

import { createHash } from "node:crypto";

import { resolveMetaClientConfigForCompany, resolveMetaGraphApiVersion } from "@/integrations/meta/meta.auth";
import { findMetaOAuthConnection } from "@/integrations/meta/meta-token.repository";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

const BUCKET = "samuel-creative";
const GRAPH_BASE = "https://graph.facebook.com";

export type MetaVideoPlatform = "facebook" | "instagram";

type PublishJobRow = {
  id: string;
  company_id: string;
  created_by: string | null;
  request_key: string;
  project_id: string | null;
  platform: MetaVideoPlatform;
  asset_path: string;
  caption: string;
  status: "queued" | "processing" | "published" | "failed";
  provider_container_id: string | null;
  provider_post_id: string | null;
  provider_payload: Record<string, unknown> | null;
  error_message: string | null;
  attempt_count: number;
  created_at: string;
  updated_at: string;
};

function graphUrl(path: string) {
  return `${GRAPH_BASE}/${resolveMetaGraphApiVersion()}/${path.replace(/^\//, "")}`;
}

function requestKey(input: { companyId: string; projectId?: string | null; platform: string; assetPath: string; caption: string }) {
  return createHash("sha256")
    .update([input.companyId, input.projectId ?? "", input.platform, input.assetPath, input.caption].join("\u001f"))
    .digest("hex");
}

function parseScopes(scopes: string | null | undefined) {
  return new Set((scopes ?? "").split(/[\s,]+/).map((item) => item.trim()).filter(Boolean));
}

async function signedAssetUrl(companyId: string, assetPath: string) {
  if (!assetPath.startsWith(`${companyId}/`)) throw new Error("O vídeo não pertence à empresa ativa.");
  const { data, error } = await getSupabaseServiceClient().storage.from(BUCKET).createSignedUrl(assetPath, 6 * 60 * 60);
  if (error || !data?.signedUrl) throw new Error(`Falha ao criar URL temporária do vídeo: ${error?.message ?? "URL ausente"}`);
  return data.signedUrl;
}

async function graphRequest(path: string, init?: RequestInit) {
  const response = await fetch(graphUrl(path), { ...init, cache: "no-store" });
  const text = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = text ? JSON.parse(text) as Record<string, unknown> : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok || payload.error) {
    const error = payload.error as { message?: string; code?: number; error_subcode?: number } | undefined;
    throw new Error(error?.message || (typeof payload.message === "string" ? payload.message : `Meta Graph API HTTP ${response.status}`));
  }
  return payload;
}

async function updateJob(id: string, values: Record<string, unknown>) {
  const { data, error } = await getSupabaseServiceClient()
    .from("samuel_social_publish_jobs")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`Falha ao atualizar publicação: ${error.message}`);
  return data as PublishJobRow;
}

export async function getPublishJob(companyId: string, jobId: string) {
  const { data, error } = await getSupabaseServiceClient()
    .from("samuel_social_publish_jobs")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw new Error(`Falha ao consultar publicação: ${error.message}`);
  return data as PublishJobRow | null;
}

export async function startMetaVideoPublish(input: {
  companyId: string;
  userId: string;
  projectId?: string | null;
  platform: MetaVideoPlatform;
  assetPath: string;
  caption: string;
}) {
  const connection = await findMetaOAuthConnection(input.companyId);
  const config = await resolveMetaClientConfigForCompany(input.companyId);
  if (!connection?.selectedExplicitly || !config?.accessToken || !config.pageId) {
    throw new Error("Conecte a Página Meta desta empresa e selecione explicitamente os ativos antes de publicar.");
  }
  const scopes = parseScopes(connection.scopes);
  if (input.platform === "facebook" && !scopes.has("pages_manage_posts")) {
    throw new Error("A conexão Meta não concedeu pages_manage_posts. Reconecte a conta depois que a app tiver a permissão aprovada.");
  }
  if (input.platform === "instagram" && !scopes.has("instagram_content_publish")) {
    throw new Error("A conexão Meta não concedeu instagram_content_publish. Reconecte a conta depois que a app tiver a permissão aprovada.");
  }
  if (input.platform === "instagram" && !config.instagramBusinessId) {
    throw new Error("Selecione uma conta profissional do Instagram ligada à Página desta empresa.");
  }

  const key = requestKey(input);
  const supabase = getSupabaseServiceClient();
  const { data: existing, error: existingError } = await supabase
    .from("samuel_social_publish_jobs")
    .select("*")
    .eq("company_id", input.companyId)
    .eq("request_key", key)
    .maybeSingle();
  if (existingError) throw new Error(`Falha ao verificar publicação anterior: ${existingError.message}`);
  if (existing && ["processing", "published"].includes(existing.status)) return existing as PublishJobRow;

  const row = {
    company_id: input.companyId,
    created_by: input.userId,
    request_key: key,
    project_id: input.projectId ?? null,
    platform: input.platform,
    asset_path: input.assetPath,
    caption: input.caption.slice(0, 2_200),
    status: "processing",
    provider_container_id: null,
    provider_post_id: null,
    provider_payload: {},
    error_message: null,
    attempt_count: (existing?.attempt_count ?? 0) + 1,
    updated_at: new Date().toISOString(),
  };
  const { data: job, error: upsertError } = await supabase
    .from("samuel_social_publish_jobs")
    .upsert(row, { onConflict: "company_id,request_key" })
    .select("*")
    .single();
  if (upsertError) throw new Error(`Falha ao iniciar publicação: ${upsertError.message}`);

  const mediaUrl = await signedAssetUrl(input.companyId, input.assetPath);
  try {
    if (input.platform === "facebook") {
      const payload = await graphRequest(`${encodeURIComponent(config.pageId)}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          file_url: mediaUrl,
          description: input.caption.slice(0, 2_200),
          published: "true",
          access_token: config.accessToken,
        }),
      });
      const postId = typeof payload.id === "string" ? payload.id : typeof payload.video_id === "string" ? payload.video_id : null;
      if (!postId) throw new Error("A Meta aceitou o pedido, mas não devolveu o ID do vídeo do Facebook.");
      const verified = await graphRequest(`${encodeURIComponent(postId)}?fields=id&access_token=${encodeURIComponent(config.accessToken)}`);
      if (verified.id !== postId) throw new Error("Não foi possível verificar o vídeo publicado no Facebook.");
      return updateJob(job.id, { status: "published", provider_post_id: postId, provider_payload: payload, error_message: null });
    }

    const container = await graphRequest(`${encodeURIComponent(config.instagramBusinessId!)}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        media_type: "REELS",
        video_url: mediaUrl,
        caption: input.caption.slice(0, 2_200),
        share_to_feed: "true",
        access_token: config.accessToken,
      }),
    });
    const containerId = typeof container.id === "string" ? container.id : null;
    if (!containerId) throw new Error("O Instagram não devolveu o ID do container do Reel.");
    return updateJob(job.id, { status: "processing", provider_container_id: containerId, provider_payload: container, error_message: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao publicar vídeo na Meta.";
    await updateJob(job.id, { status: "failed", error_message: message });
    throw error;
  }
}

export async function advanceMetaVideoPublish(job: PublishJobRow) {
  if (job.status !== "processing" || job.platform !== "instagram" || !job.provider_container_id) return job;
  const config = await resolveMetaClientConfigForCompany(job.company_id);
  if (!config?.accessToken || !config.instagramBusinessId) throw new Error("Conexão Instagram desta empresa está indisponível.");

  try {
    const status = await graphRequest(`${encodeURIComponent(job.provider_container_id)}?fields=status_code,status&access_token=${encodeURIComponent(config.accessToken)}`);
    const statusCode = typeof status.status_code === "string" ? status.status_code.toUpperCase() : "";
    if (["ERROR", "EXPIRED"].includes(statusCode)) {
      const message = typeof status.status === "string" ? status.status : `Instagram container ${statusCode}`;
      return updateJob(job.id, { status: "failed", error_message: message, provider_payload: status });
    }
    if (statusCode !== "FINISHED") {
      return updateJob(job.id, { provider_payload: status, error_message: null });
    }

    const published = await graphRequest(`${encodeURIComponent(config.instagramBusinessId)}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: job.provider_container_id, access_token: config.accessToken }),
    });
    const mediaId = typeof published.id === "string" ? published.id : null;
    if (!mediaId) throw new Error("O Instagram não devolveu o ID do Reel publicado.");
    const verified = await graphRequest(`${encodeURIComponent(mediaId)}?fields=id,permalink,media_type&access_token=${encodeURIComponent(config.accessToken)}`);
    if (verified.id !== mediaId) throw new Error("Não foi possível verificar o Reel publicado.");
    return updateJob(job.id, { status: "published", provider_post_id: mediaId, provider_payload: verified, error_message: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao verificar publicação no Instagram.";
    return updateJob(job.id, { status: "failed", error_message: message });
  }
}
