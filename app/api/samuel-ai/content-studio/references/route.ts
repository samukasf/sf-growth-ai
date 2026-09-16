import { randomUUID } from "node:crypto";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "samuel-creative";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function clean(value: FormDataEntryValue | null, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeName(name: string) {
  return name.replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-").slice(-100) || "reference-image";
}

async function signedUrl(assetPath: string) {
  const { data, error } = await getSupabaseServiceClient().storage.from(BUCKET).createSignedUrl(assetPath, 12 * 60 * 60);
  if (error || !data?.signedUrl) throw new Error(error?.message || "URL segura indisponível.");
  return data.signedUrl;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim().slice(0, 80) || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const prefix = `${companyId}/references`;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 60,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) return Response.json({ error: `Falha ao listar referências: ${error.message}` }, { status: 502 });

  const items = await Promise.all((data ?? []).filter((item) => item.name && item.id).map(async (item) => {
    const assetPath = `${prefix}/${item.name}`;
    try {
      return {
        assetPath,
        name: item.name,
        previewUrl: await signedUrl(assetPath),
        createdAt: item.created_at ?? null,
        size: typeof item.metadata?.size === "number" ? item.metadata.size : null,
        mimeType: typeof item.metadata?.mimetype === "string" ? item.metadata.mimetype : null,
      };
    } catch {
      return null;
    }
  }));

  return Response.json({ references: items.filter(Boolean) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_IMAGE_BYTES + 1_000_000) {
    return Response.json({ error: "A imagem excede o limite de 8 MB." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Upload inválido." }, { status: 400 });
  const companyId = clean(form.get("companyId"), 80) || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Imagem obrigatória." }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: "Use JPG, PNG ou WebP." }, { status: 415 });
  }
  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "A imagem precisa ter até 8 MB." }, { status: 413 });
  }

  const assetPath = `${companyId}/references/${randomUUID()}-${safeName(file.name)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const supabase = getSupabaseServiceClient();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(assetPath, bytes, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) {
    return Response.json({ error: `Falha ao guardar referência: ${uploadError.message}` }, { status: 502 });
  }

  return Response.json({
    reference: {
      assetPath,
      name: file.name,
      previewUrl: await signedUrl(assetPath),
      mimeType: file.type,
      size: file.size,
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null) as { companyId?: string; assetPath?: string } | null;
  const companyId = body?.companyId?.trim().slice(0, 80) || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  const assetPath = body?.assetPath?.trim() || "";
  if (!assetPath.startsWith(`${companyId}/references/`)) {
    return Response.json({ error: "Referência inválida para esta empresa." }, { status: 400 });
  }
  const { error } = await getSupabaseServiceClient().storage.from(BUCKET).remove([assetPath]);
  if (error) return Response.json({ error: `Falha ao remover referência: ${error.message}` }, { status: 502 });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
