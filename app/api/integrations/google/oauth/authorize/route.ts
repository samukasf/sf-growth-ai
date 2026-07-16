import { NextResponse } from "next/server";

import { buildGmailOAuthAuthorizeUrl, resolveGoogleOAuthConfig } from "@/integrations/gmail";
import { resolveActiveCompany } from "@/services/executive-context.service";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyIdParam = url.searchParams.get("companyId")?.trim();

  if (!resolveGoogleOAuthConfig()) {
    return NextResponse.json(
      {
        error:
          "Google OAuth não configurado. Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_OAUTH_REDIRECT_URI.",
      },
      { status: 503 },
    );
  }

  try {
    const company = await resolveActiveCompany(
      companyIdParam && UUID_PATTERN.test(companyIdParam) ? companyIdParam : null,
    );

    if (!company) {
      return NextResponse.json({ error: "Nenhuma empresa disponível para conectar." }, { status: 404 });
    }

    const authorizeUrl = buildGmailOAuthAuthorizeUrl(company.id);
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao iniciar OAuth Google";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
