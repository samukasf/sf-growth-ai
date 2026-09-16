import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  elevenVideoReadiness,
  getElevenVideoGeneration,
  startElevenVideoGeneration,
} from "@/features/samuel-ai/content-studio/elevenlabs-video.server";
import {
  getRunwayVideoGeneration,
  runwayVideoReadiness,
  startRunwayVideoGeneration,
} from "@/features/samuel-ai/content-studio/runway-video.server";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "samuel-creative";
const MAX_VIDEO_BYTES = 96 * 1024 * 1024;
type VideoProvider = "elevenlabs" | "runway";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function formatFromAspectRatio(value: string) {
  return value === "16:9" ? "landscape" : value === "1:1" ? "square" : "portrait";
}

function jobKey(provider: VideoProvider, generationId: string) {
  return `${provider}-video:${generationId}`;
}

function parseReferenceImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && /^https:\/\//i.test(item))
    .slice(0, 10);
}

async function signedPreview(assetPath: string) {
  const { data, error } = await getSupabaseServiceClient().storage.from(BUCKET).createSignedUrl(assetPath, 6 * 60 * 60);
  if (error || !data?.signedUrl) throw new Error(`Falha ao criar URL segura do vídeo: ${error?.message ?? "URL ausente"}`);
  return data.signedUrl;
}

function chooseProvider(requested: string, hasReferences: boolean): VideoProvider {
  const eleven = elevenVideoReadiness();
  const runway = runwayVideoReadiness();
  if (requested === "runway") {
    if (!runway.configured) throw new Error(runway.detail);
    return "runway";
  }
  if (requested === "elevenlabs") {
    if (!eleven.configured) throw new Error(eleven.detail);
    return "elevenlabs";
  }
  if (hasReferences && runway.configured) return "runway";
  if (eleven.configured) return "elevenlabs";
  if (runway.configured) return "runway";
  throw new Error("Nenhum provedor de vídeo IA está habilitado. O renderizador Samuel com imagens de referência continua disponível sem API de vídeo externa.");
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
  const referenceImages = parseReferenceImages(body?.referenceImages);
  if (prompt.length < 20) return Response.json({ error: "Descreva o vídeo com mais detalhe." }, { status: 400 });

  try {
    const provider = chooseProvider(clean(body?.provider, 20), referenceImages.length > 0);
    const generation = provider === "runway"
      ? await startRunwayVideoGeneration({ prompt, aspectRatio, referenceImageUrl: referenceImages[0] ?? null })
      : await startElevenVideoGeneration({ prompt, aspectRatio, resolution });

    const output = {
      provider,
      generation_id: generation.id,
      model: generation.model,
      duration_seconds: generation.durationSeconds,
      project_id: projectId || null,
      aspect_ratio: aspectRatio,
      resolution: provider === "elevenlabs" ? resolution : "provider-default",
      reference_count: referenceImages.length,
    };
    const { data, error } = await getSupabaseServiceClient()
      .from("samuel_creative_jobs")
      .insert({
        user_id: auth.user.id,
        company_id: companyId,
        request_key: jobKey(provider, generation.id),
        kind: "video",
        format: formatFromAspectRatio(aspectRatio),
        prompt,
        title,
        status: "generating",
        output,
      })
      .select("id,status,output")
      .single();
    if (error) throw new Error(`Falha ao registar geração: ${error.message}`);
    return Response.json({
      jobId: data.id,
      generationId: generation.id,
      provider,
      status: data.status,
      model: generation.model,
      durationSeconds: generation.durationSeconds,
      resolution: output.resolution,
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
  const { data: jobs, error: jobError } = await supabase
    .from("samuel_creative_jobs")
    .select("id,status,output,error_message,request_key")
    .eq("user_id", auth.user.id)
    .eq("company_id", companyId)
    .in("request_key", [jobKey("elevenlabs", generationId), jobKey("runway", generationId)])
    .limit(1);
  if (jobError) return Response.json({ error: jobError.message }, { status: 500 });
  const job = jobs?.[0];
  if (!job) return Response.json({ error: "Geração não encontrada para esta empresa." }, { status: 404 });

  const existingOutput = (job.output ?? {}) as Record<string, unknown>;
  const provider: VideoProvider = existingOutput.provider === "runway" ? "runway" : "elevenlabs";
  const existingAssetPath = typeof existingOutput.asset_path === "string" ? existingOutput.asset_path : null;
  if (job.status === "ready" && existingAssetPath) {
    return Response.json({
      jobId: job.id,
      generationId,
      provider,
      status: "completed",
      assetPath: existingAssetPath,
      previewUrl: await signedPreview(existingAssetPath),
      mimeType: "video/mp4",
      resolution: existingOutput.resolution ?? null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  }
  if (job.status === "failed") {
    return Response.json({ provider, status: "failed", error: job.error_message || "A geração de vídeo falhou." }, { status: 502 });
  }

  try {
    let status = "generating";
    let remoteUrl: string | null = null;
    let mimeType = "video/mp4";
    let failure: string | null = null;

    if (provider === "runway") {
      const generation = await getRunwayVideoGeneration(generationId);
      status = generation.status.toLowerCase();
      if (generation.status === "FAILED" || generation.status === "CANCELED") {
        failure = generation.failure || `Runway ${generation.status.toLowerCase()}.`;
      } else if (generation.status === "SUCCEEDED") {
        remoteUrl = generation.output?.[0] ?? null;
      }
    } else {
      const generation = await getElevenVideoGeneration(generationId);
      status = generation.status;
      if (generation.status === "failed") failure = generation.error_message || generation.failure_reason || "A ElevenLabs não concluiu o vídeo.";
      if (generation.status === "completed") {
        remoteUrl = generation.content_url ?? null;
        mimeType = generation.content_mime_type || "video/mp4";
      }
    }

    if (failure) {
      await supabase.from("samuel_creative_jobs").update({ status: "failed", error_message: failure, updated_at: new Date().toISOString() }).eq("id", job.id);
      return Response.json({ provider, status: "failed", error: failure }, { status: 502 });
    }
    if (!remoteUrl) {
      return Response.json({ jobId: job.id, generationId, provider, status }, { status: 202, headers: { "Retry-After": "10", "Cache-Control": "private, no-store" } });
    }

    const remote = await fetch(remoteUrl, { cache: "no-store" });
    if (!remote.ok) throw new Error(`Falha ao baixar vídeo final de ${provider} (HTTP ${remote.status}).`);
    const declaredLength = Number(remote.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_VIDEO_BYTES) throw new Error("O vídeo final excede o limite de 96 MB do workspace criativo.");
    const bytes = new Uint8Array(await remote.arrayBuffer());
    if (bytes.byteLength > MAX_VIDEO_BYTES) throw new Error("O vídeo final excede o limite de 96 MB do workspace criativo.");

    const projectId = typeof existingOutput.project_id === "string" && existingOutput.project_id ? existingOutput.project_id : "generated";
    const safeProject = projectId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80) || "generated";
    const assetPath = `${companyId}/${safeProject}/${provider}-${generationId}.mp4`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(assetPath, bytes, {
      contentType: mimeType.startsWith("video/") ? mimeType : "video/mp4",
      upsert: true,
      cacheControl: "3600",
    });
    if (uploadError) throw new Error(`Falha ao guardar vídeo final: ${uploadError.message}`);

    const nextOutput = {
      ...existingOutput,
      asset_path: assetPath,
      source_url: remoteUrl,
      content_mime_type: mimeType,
    };
    await supabase.from("samuel_creative_jobs").update({ status: "ready", output: nextOutput, error_message: null, updated_at: new Date().toISOString() }).eq("id", job.id);
    return Response.json({
      jobId: job.id,
      generationId,
      provider,
      status: "completed",
      assetPath,
      previewUrl: await signedPreview(assetPath),
      mimeType: "video/mp4",
      resolution: existingOutput.resolution ?? null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao concluir vídeo IA.";
    await supabase.from("samuel_creative_jobs").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("id", job.id);
    return Response.json({ provider, status: "failed", error: message }, { status: 502 });
  }
}
