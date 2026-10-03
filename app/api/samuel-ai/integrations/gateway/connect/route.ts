import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { createComposioConnectLink } from "@/features/samuel-ai/integrations/composio-gateway.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { companyId?: string; toolkit?: string; sessionId?: string }
    | null;
  const companyId = body?.companyId?.trim() || "default-company";
  const toolkit = body?.toolkit?.trim() || "";
  if (!toolkit) {
    return Response.json({ error: "Toolkit obrigatório." }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId, {
    allowWorkspaceFallback: true,
  });
  if (!auth.ok) return auth.response;

  const origin = new URL(request.url).origin;
  const callback = new URL("/samuel-ai", origin);
  callback.searchParams.set("integration", "connected");
  callback.searchParams.set("toolkit", toolkit);

  try {
    const link = await createComposioConnectLink({
      userId: auth.user.id,
      companyId,
      toolkit,
      sessionId: body?.sessionId?.trim() || undefined,
      callbackUrl: callback.toString(),
    });
    return Response.json({ ok: true, link }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao iniciar conexão." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
