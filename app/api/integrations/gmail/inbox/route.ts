import { NextResponse } from "next/server";

import { GmailApiError, getGmailClientForCompany } from "@/integrations/gmail";

const ERROR_STATUS: Record<string, number> = {
  NOT_CONFIGURED: 503,
  NOT_CONNECTED: 400,
  INVALID_COMPANY_ID: 400,
  AUTH_ERROR: 401,
  TOKEN_REFRESH_FAILED: 401,
  NETWORK_ERROR: 502,
};

/**
 * Prova de funcionamento da Sprint 83/86: executa uma chamada REAL à Gmail
 * API (Inbox) para a empresa informada. Nunca devolve dados simulados — se a
 * conexão não existir ou as credenciais não estiverem configuradas, devolve
 * o erro real da integração.
 *
 * Uso: GET /api/integrations/gmail/inbox?companyId=<uuid>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId")?.trim();

  if (!companyId) {
    return NextResponse.json({ error: "companyId é obrigatório" }, { status: 400 });
  }

  try {
    const client = await getGmailClientForCompany(companyId);
    const inbox = await client.getInboxSummary(10);

    return NextResponse.json({ source: "gmail-api-real", ...inbox });
  } catch (error) {
    if (error instanceof GmailApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: ERROR_STATUS[error.code] ?? 500 },
      );
    }
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
