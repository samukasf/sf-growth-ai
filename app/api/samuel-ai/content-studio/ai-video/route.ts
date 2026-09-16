import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  getElevenVideoGeneration,
  startElevenVideoGeneration,
} from "@/features/samuel-ai/content-studio/elevenlabs-video.server";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "samuel-creative";
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function formatFromAspectRatio(value: string) {
  return value === "16:9" ? "landscape" : value === "1:1" ? "square" : "portrait";
}

function jobKey(generationId: string) {
  return `eleven-video:${generationId}`;
}

async function signedPreview(assetPath: string) {
  const { data, error } = await getSupabaseServiceClient().storage.from(BUCKET).createSignedUrl(assetPath, 6 * 60 * 60);
  if (error || !data?.signedUrl) throw new Error(`Falha ao criar URL segura do vídeo: ${error?.message ?? "URL ausente"}`);
  return data.signedUrl;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const companyId = clean(body?.companyId, 80);
  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  const prompt = clean(body?.prompt, 3_500);
  const title = clean(body?.title, 120) || "Vídeo Samuel IA";
  const projectId = clean(body?.projectId, 120);
  const aspectRatio = body?.aspectRatio === "16:9" || body?.aspectRatio === "1:1" ? body.aspectRatio : "9:16";
  const resolution = body?.resolution === "720p" ? "720p" : "1080p";
  if (prompt.length < 20) return Response.json({ error: "Descreva o vídeo com mais detalhe." }, { status: 400 });

  try {
    const generation = await startElevenVideoGeneration({ prompt, aspectRatio, resolution });
    const { data, error } = await getSupabaseServiceClient()
      .from("samuel_creative_jobs")
      .insert({
        user_id: auth.user.id,
        company_id: companyId,
        request_key: jobKey(generation.id),
        kind: "video",
        format: formatFromAspectRatio(aspectRatio),
        prompt,
        title,
        status: "generating",
        output: {
          provider: "elevenlabs",
          generation_id: generation.id,
          model: generation.model,
          duration_seconds: generation.durationSeconds,
          project_id: projectId || null,
          aspect_ratio: aspectRatio,
          resolution: generation.resolution,
        },
      })
      .select("id,status,output")
      .single();
    if (error) throw new Error(`Falha ao registar geração: ${error.message}`);
    return Response.json({
      jobId: data.id,
      generationId: generation.id,
      status: data.status,
      model: generation.model,
      durationSeconds: generation.durationSeconds,
      resolution: generation.resolution,
    }, { status: 202, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao iniciar vídeo IA." }, { status: 502 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = clean(url.searchParams.get("companyId"), 80);
  const generationId = clean(url.searchParams.get("generationId"), 160);
  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;
  if (!generationId) return Response.json({ error: "generationId obrigatório." }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  const { data: job, error: jobError } = await supabase
    .from("samuel_creative_jobs")
    .select("id,status,output,error_message")
    .eq("user_id", auth.user.id)
    .eq("company_id", companyId)
    .eq("request_key", jobKey(generationId))
    .maybeSingle();
  if (jobError) return Response.json({ error: jobError.message }, { status: 500 });
  if (!job) return Response.json({ error: "Geração não encontrada para esta empresa." }, { status: 404 });

  const existingOutput = (job.output ?? {}) as Record<string, unknown>;
  const existingAssetPath = typeof existingOutput.asset_path === "string" ? existingOutput.asset_path : null;
  if (job.status === "ready" && existingAssetPath) {
    return Response.json({
      jobId: job.id,
      generationId,
      status: "completed",
      assetPath: existingAssetPath,
      previewUrl: await signedPreview(existingAssetPath),
      mimeType: "video/mp4",
      resolution: existingOutput.resolution ?? null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  }
  if (job.status === "failed") {
    return Response.json({ status: "failed", error: job.error_message || "A geração de vídeo falhou." }, { status: 502 });
  }

  try {
    const generation = await getElevenVideoGeneration(generationId);
    if (generation.status === "failed") {
      const message = generation.error_message || generation.failure_reason || "A ElevenLabs não concluiu o vídeo.";
      await supabase.from("samuel_creative_jobs").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("id", job.id);
      return Response.json({ status: "failed", error: message }, { status: 502 });
    }
    if (generation.status !== "completed" || !generation.content_url) {
      return Response.json({ jobId: job.id, generationId, status: generation.status }, { status: 202, headers: { "Retry-After": "10", "Cache-Control": "private, no-store" } });
    }

    const remote = await fetch(generation.content_url, { cache: "no-store" });
    if (!remote.ok) throw new Error(`Falha ao baixar vídeo final da ElevenLabs (HTTP ${remote.status}).`);
    const declaredLength = Number(remote.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_VIDEO_BYTES) throw new Error("O vídeo final excede o limite de 64 MB do workspace criativo.");
    const bytes = new Uint8Array(await remote.arrayBuffer());
    if (bytes.byteLength > MAX_VIDEO_BYTES) throw new Error("O vídeo final excede o limite de 64 MB do workspace criativo.");

    const projectId = typeof existingOutput.project_id === "string" && existingOutput.project_id ? existingOutput.project_id : "generated";
    const safeProject = projectId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80) || "generated";
    const assetPath = `${companyId}/${safeProject}/eleven-${generationId}.mp4`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(assetPath, bytes, {
      contentType: "video/mp4",
      upsert: true,
      cacheControl: "3600",
    });
    if (uploadError) throw new Error(`Falha ao guardar vídeo final: ${uploadError.message}`);

    const nextOutput = {
      ...existingOutput,
      asset_path: assetPath,
      source_url: generation.content_url,
      content_mime_type: generation.content_mime_type || "video/mp4",
    };
    await supabase.from("samuel_creative_jobs").update({ status: "ready", output: nextOutput, error_message: null, updated_at: new Date().toISOString() }).eq("id", job.id);
    return Response.json({
      jobId: job.id,
      generationId,
      status: "completed",
      assetPath,
      previewUrl: await signedPreview(assetPath),
      mimeType: "video/mp4",
      resolution: existingOutput.resolution ?? null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao concluir vídeo IA.";
    await supabase.from("samuel_creative_jobs").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("id", job.id);
    return Response.json({ status: "failed", error: message }, { status: 502 });
  }
}
