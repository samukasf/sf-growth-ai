import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { searchComposioTools } from "@/features/samuel-ai/integrations/composio-gateway.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { companyId?: string; query?: string }
    | null;
  const companyId = body?.companyId?.trim() || "default-company";
  const query = body?.query?.trim() || "";
  if (!query || query.length > 1500) {
    return Response.json({ error: "Objetivo de integração inválido." }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId, {
    allowWorkspaceFallback: true,
  });
  if (!auth.ok) return auth.response;

  try {
    const result = await searchComposioTools({
      userId: auth.user.id,
      companyId,
      useCase: query,
    });
    return Response.json({ ok: true, result }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha no gateway de integrações." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
