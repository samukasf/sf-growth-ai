import { NextResponse } from "next/server";

import { buildMetaOAuthAuthorizeUrl, resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";
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

  const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
  const company = await resolveActiveCompany(
    companyId && UUID_PATTERN.test(companyId) ? companyId : null,
  ).catch(() => null);

  const state = company?.id ?? "default";
  const authorizeUrl = buildMetaOAuthAuthorizeUrl(state);
  if (!authorizeUrl) {
    return NextResponse.json({ error: "Não foi possível gerar URL Meta OAuth." }, { status: 500 });
  }

  return NextResponse.redirect(authorizeUrl);
}
