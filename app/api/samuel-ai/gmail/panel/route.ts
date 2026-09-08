import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { executeGmailTool } from "@/features/gmail";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim();
  const messageId = url.searchParams.get("messageId")?.trim();
  const query = url.searchParams.get("q")?.trim();

  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  const result = messageId
    ? await executeGmailTool(companyId, "gmail_read", { messageId })
    : query
      ? await executeGmailTool(companyId, "gmail_search", { query, maxResults: 24 })
      : await executeGmailTool(companyId, "gmail_inbox", { maxResults: 24 });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "Cache-Control": "private, no-store" },
  });
}
