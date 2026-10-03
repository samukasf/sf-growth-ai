import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { composioGatewayReadiness } from "@/features/samuel-ai/integrations/composio-gateway.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, {
    allowWorkspaceFallback: true,
  });
  if (!auth.ok) return auth.response;

  return Response.json(composioGatewayReadiness(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
