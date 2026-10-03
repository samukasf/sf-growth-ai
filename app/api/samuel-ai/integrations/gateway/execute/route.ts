import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { executeComposioTool } from "@/features/samuel-ai/integrations/composio-gateway.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        companyId?: string;
        toolSlug?: string;
        arguments?: Record<string, unknown>;
        account?: string;
        confirm?: boolean;
      }
    | null;
  const companyId = body?.companyId?.trim() || "default-company";
  const toolSlug = body?.toolSlug?.trim() || "";

  const auth = await authorizeCompanyRequest(companyId, {
    allowWorkspaceFallback: true,
  });
  if (!auth.ok) return auth.response;

  // Generic third-party tools are treated as sensitive until a toolkit-specific
  // risk policy exists. This prevents dynamic integrations from bypassing the
  // Samuel approval model.
  if (body?.confirm !== true) {
    return Response.json(
      {
        error:
          "Confirmação explícita obrigatória para executar uma integração dinâmica.",
        code: "CONFIRMATION_REQUIRED",
      },
      { status: 400 },
    );
  }
  if (!toolSlug) {
    return Response.json({ error: "Ferramenta obrigatória." }, { status: 400 });
  }

  try {
    const result = await executeComposioTool({
      userId: auth.user.id,
      companyId,
      toolSlug,
      arguments: body?.arguments ?? {},
      account: body?.account?.trim() || null,
    });
    return Response.json({ ok: true, result }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Falha ao executar integração." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
