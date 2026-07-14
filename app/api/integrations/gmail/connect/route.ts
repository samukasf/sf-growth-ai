import { NextResponse } from "next/server";

import { buildGmailOAuthAuthorizeUrl } from "@/integrations/gmail";
import { GmailApiError } from "@/integrations/gmail";

/**
 * Inicia o consentimento OAuth do Gmail para uma empresa (Sprint 86).
 * Uso: GET /api/integrations/gmail/connect?companyId=<uuid>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId")?.trim();

  if (!companyId) {
    return NextResponse.json({ error: "companyId é obrigatório" }, { status: 400 });
  }

  try {
    const authorizeUrl = buildGmailOAuthAuthorizeUrl(companyId);
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    if (error instanceof GmailApiError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
