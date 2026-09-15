import { randomUUID } from "node:crypto";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "samuel-creative";
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

function clean(value: FormDataEntryValue | null, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_VIDEO_BYTES + 1_000_000) {
    return Response.json({ error: "O vídeo excede o limite de 64 MB." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Upload inválido." }, { status: 400 });
  const companyId = clean(form.get("companyId"), 80);
  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  const projectId = clean(form.get("projectId"), 120) || "campaign";
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Arquivo de vídeo obrigatório." }, { status: 400 });
  if (file.type !== "video/mp4") {
    return Response.json({ error: "Para publicação automática, envie vídeo MP4/H.264." }, { status: 415 });
  }
  if (!file.size || file.size > MAX_VIDEO_BYTES) {
    return Response.json({ error: "O vídeo precisa ter até 64 MB." }, { status: 413 });
  }

  const safeProject = projectId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80) || "campaign";
  const assetPath = `${companyId}/${safeProject}/browser-${randomUUID()}.mp4`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const supabase = getSupabaseServiceClient();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(assetPath, bytes, {
    contentType: "video/mp4",
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) {
    return Response.json({ error: `Falha ao guardar vídeo: ${uploadError.message}` }, { status: 502 });
  }

  const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(assetPath, 6 * 60 * 60);
  if (signedError || !signed?.signedUrl) {
    return Response.json({ error: "Vídeo guardado, mas a prévia segura não pôde ser criada." }, { status: 502 });
  }

  return Response.json(
    { assetPath, previewUrl: signed.signedUrl, mimeType: "video/mp4", size: file.size },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
