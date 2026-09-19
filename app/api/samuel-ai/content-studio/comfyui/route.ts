import { randomUUID } from "node:crypto";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  listDesktopDevices,
  queueDesktopCommand,
} from "@/features/samuel-desktop/server/desktop-agent.server";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "samuel-creative";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function hasCapability(value: unknown, capability: string) {
  return Array.isArray(value) && value.some((item) => item === capability);
}

async function findComfyDevice(userId: string, companyId: string) {
  const devices = await listDesktopDevices(userId);
  const candidates = devices
    .filter(
      (device) =>
        device.status === "paired" &&
        hasCapability(device.capabilities, "comfyui.local_api"),
    )
    .sort((a, b) => {
      const aCompany = a.company_id === companyId ? 1 : 0;
      const bCompany = b.company_id === companyId ? 1 : 0;
      if (aCompany !== bCompany) return bCompany - aCompany;
      return Date.parse(b.last_seen_at ?? "1970-01-01") - Date.parse(a.last_seen_at ?? "1970-01-01");
    });
  return candidates[0] ?? null;
}

function dimensions(
  aspectRatio: "9:16" | "16:9" | "1:1",
  resolution: "720p" | "1080p",
) {
  if (resolution === "720p") {
    if (aspectRatio === "16:9") return { width: 1280, height: 720 };
    if (aspectRatio === "1:1") return { width: 720, height: 720 };
    return { width: 720, height: 1280 };
  }
  if (aspectRatio === "16:9") return { width: 1920, height: 1080 };
  if (aspectRatio === "1:1") return { width: 1080, height: 1080 };
  return { width: 1080, height: 1920 };
}

async function readiness(userId: string, companyId: string) {
  const device = await findComfyDevice(userId, companyId);
  return {
    ready: Boolean(device),
    deviceId: device?.id ?? null,
    deviceName: device?.device_name ?? null,
    detail: device
      ? `Samuel Desktop conectado em ${device.device_name}. O vídeo será processado pelo ComfyUI local.`
      : "Atualize/abra o Samuel Desktop com a ponte ComfyUI ativa para usar o motor local.",
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = clean(url.searchParams.get("companyId"), 80) || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const generationId = clean(url.searchParams.get("generationId"), 80);
  if (!generationId) {
    return Response.json(
      { readiness: await readiness(auth.user.id, companyId) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }
  if (!UUID_PATTERN.test(generationId)) {
    return Response.json({ error: "generationId inválido." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data: command, error } = await supabase
    .from("samuel_desktop_commands")
    .select("id,status,result,error_message,device_id,company_id,created_at,completed_at")
    .eq("id", generationId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!command) return Response.json({ error: "Geração local não encontrada." }, { status: 404 });

  if (command.status === "failed" || command.status === "cancelled") {
    return Response.json(
      {
        provider: "comfyui",
        status: "failed",
        error: command.error_message || "A geração local não foi concluída.",
      },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  if (command.status !== "verified") {
    return Response.json(
      {
        generationId,
        provider: "comfyui",
        status: command.status === "running" ? "generating" : "queued",
      },
      {
        status: 202,
        headers: { "Retry-After": "5", "Cache-Control": "private, no-store" },
      },
    );
  }

  const result =
    command.result && typeof command.result === "object" && !Array.isArray(command.result)
      ? (command.result as Record<string, unknown>)
      : {};
  const assetPath = typeof result.assetPath === "string" ? result.assetPath : "";
  if (!assetPath) {
    return Response.json(
      { provider: "comfyui", status: "failed", error: "O desktop concluiu sem informar o arquivo final." },
      { status: 502 },
    );
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(assetPath, 6 * 60 * 60);
  if (signedError || !signed?.signedUrl) {
    return Response.json(
      { provider: "comfyui", status: "failed", error: signedError?.message || "Falha ao abrir o vídeo final." },
      { status: 502 },
    );
  }

  return Response.json(
    {
      generationId,
      provider: "comfyui",
      status: "completed",
      assetPath,
      previewUrl: signed.signedUrl,
      mimeType: typeof result.mimeType === "string" ? result.mimeType : "video/mp4",
      localPromptId: typeof result.promptId === "string" ? result.promptId : null,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const companyId = clean(body?.companyId, 80) || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const prompt = clean(body?.prompt, 8_000);
  if (prompt.length < 20) {
    return Response.json({ error: "Descreva o vídeo com mais detalhe." }, { status: 400 });
  }

  const aspectRatio =
    body?.aspectRatio === "16:9" || body?.aspectRatio === "1:1" ? body.aspectRatio : "9:16";
  const resolution = body?.resolution === "720p" ? "720p" : "1080p";
  const mode = body?.mode === "single-shot" ? "single-shot" : "multi-shot";
  const durationSeconds = Math.max(3, Math.min(20, Number(body?.durationSeconds) || 8));
  const referenceImages = Array.isArray(body?.referenceImages)
    ? body.referenceImages
        .filter((value): value is string => typeof value === "string" && /^https:\/\//i.test(value))
        .slice(0, 1)
    : [];
  const voiceProvider = body?.voiceProvider === "openai" ? "openai" : "elevenlabs";
  const voiceId = clean(body?.voiceId, 128);
  const voiceName = clean(body?.voiceName, 120);

  const device = await findComfyDevice(auth.user.id, companyId);
  if (!device) {
    return Response.json(
      {
        error:
          "Nenhum Samuel Desktop atualizado com a ponte ComfyUI está conectado. Abra/atualize o Samuel Desktop neste computador.",
        code: "COMFYUI_DESKTOP_NOT_READY",
      },
      { status: 503 },
    );
  }

  const runId = randomUUID();
  const safeCompany = companyId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80) || "workspace";
  const assetPath = `${safeCompany}/comfyui/${runId}.mp4`;
  const supabase = getSupabaseServiceClient();
  const { data: upload, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(assetPath, { upsert: true });
  if (uploadError || !upload?.signedUrl) {
    return Response.json(
      { error: uploadError?.message || "Não foi possível preparar o armazenamento do vídeo." },
      { status: 502 },
    );
  }

  try {
    const size = dimensions(aspectRatio, resolution);
    const command = await queueDesktopCommand({
      userId: auth.user.id,
      deviceId: device.id,
      companyId: UUID_PATTERN.test(companyId) ? companyId : null,
      action: "comfyui.generate",
      args: {
        prompt,
        aspectRatio,
        resolution,
        width: size.width,
        height: size.height,
        durationSeconds,
        fps: 24,
        mode,
        referenceImageUrl: referenceImages[0] ?? null,
        voice: voiceId
          ? { provider: voiceProvider, id: voiceId, name: voiceName || null }
          : null,
        upload: {
          signedUrl: upload.signedUrl,
          assetPath,
          contentType: "video/mp4",
        },
      },
      risk: "mutate",
      approved: true,
      approvalReference: `content-studio:${runId}`,
    });

    return Response.json(
      {
        jobId: command.id,
        generationId: command.id,
        provider: "comfyui",
        mode,
        status: "queued",
        deviceName: device.device_name,
        voice: voiceId ? { provider: voiceProvider, id: voiceId, name: voiceName || null } : null,
      },
      { status: 202, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao enviar a geração para o Samuel Desktop." },
      { status: 502 },
    );
  }
}
