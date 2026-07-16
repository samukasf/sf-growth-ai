import { NextResponse } from "next/server";

import { resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";
import { buildSignedMetaOAuthAuthorizeUrl } from "@/integrations/meta/meta.oauth";
import { resolveActiveCompany } from "@/services/executive-context.service";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!resolveMetaOAuthConfig()) {
    return NextResponse.json(
      {
        error:
          "Meta OAuth não configurado. Defina META_APP_ID, META_APP_SECRET e META_OAUTH_REDIRECT_URI.",
      },
      { status: 503 },
    );
  }

  const companyIdParam = new URL(request.url).searchParams.get("companyId")?.trim();

  try {
    const company = await resolveActiveCompany(
      companyIdParam && UUID_PATTERN.test(companyIdParam) ? companyIdParam : null,
    );

    if (!company) {
      return NextResponse.json({ error: "Nenhuma empresa disponível para conectar." }, { status: 404 });
    }

    const authorizeUrl = buildSignedMetaOAuthAuthorizeUrl(company.id);
    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao iniciar OAuth Meta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
