import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  generateLongVideoProject,
  validateLongVideoRequest,
} from "@/features/samuel-ai/content-studio/long-video.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const companyId = typeof body?.companyId === "string" ? body.companyId.trim() : "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;
  try {
    const input = validateLongVideoRequest(body);
    const generated = await generateLongVideoProject(input);
    return Response.json(generated, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível criar o vídeo longo." }, { status: 400 });
  }
}
