import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  advanceMetaVideoPublish,
  getPublishJob,
  startMetaVideoPublish,
  type MetaVideoPlatform,
} from "@/features/samuel-ai/content-studio/samuel-meta-video-publisher.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function isMetaVideoPlatform(value: unknown): value is MetaVideoPlatform {
  return value === "facebook" || value === "instagram";
}

function publicJob(job: Awaited<ReturnType<typeof getPublishJob>>) {
  if (!job) return null;
  return {
    id: job.id,
    platform: job.platform,
    status: job.status,
    providerContainerId: job.provider_container_id,
    providerPostId: job.provider_post_id,
    providerPayload: job.provider_payload ?? {},
    error: job.error_message,
    attemptCount: job.attempt_count,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const companyId = clean(body?.companyId, 80);
  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  if (body?.confirm !== true) {
    return Response.json(
      { error: "Confirmação explícita obrigatória antes de publicar." },
      { status: 400 },
    );
  }

  const platform = body?.platform;
  if (!isMetaVideoPlatform(platform)) {
    return Response.json({ error: "Esta rota publica vídeo apenas no Facebook ou Instagram." }, { status: 400 });
  }

  const assetPath = clean(body?.assetPath, 600);
  const caption = clean(body?.caption, 2_200);
  const projectId = clean(body?.projectId, 120) || null;
  if (!assetPath || !caption) {
    return Response.json({ error: "Vídeo e legenda são obrigatórios." }, { status: 400 });
  }

  try {
    const job = await startMetaVideoPublish({
      companyId,
      userId: auth.user.id,
      projectId,
      platform,
      assetPath,
      caption,
    });
    return Response.json(
      { job: publicJob(job) },
      {
        status: job.status === "published" ? 200 : 202,
        headers: { "Cache-Control": "private, no-store", ...(job.status === "processing" ? { "Retry-After": "8" } : {}) },
      },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao iniciar publicação." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = clean(url.searchParams.get("companyId"), 80);
  const jobId = clean(url.searchParams.get("jobId"), 80);
  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;
  if (!UUID_PATTERN.test(jobId)) return Response.json({ error: "jobId inválido." }, { status: 400 });

  try {
    const job = await getPublishJob(companyId, jobId);
    if (!job) return Response.json({ error: "Publicação não encontrada." }, { status: 404 });
    const advanced = job.status === "processing" ? await advanceMetaVideoPublish(job) : job;
    return Response.json(
      { job: publicJob(advanced) },
      {
        status: advanced.status === "processing" ? 202 : 200,
        headers: { "Cache-Control": "private, no-store", ...(advanced.status === "processing" ? { "Retry-After": "8" } : {}) },
      },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao verificar publicação." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
