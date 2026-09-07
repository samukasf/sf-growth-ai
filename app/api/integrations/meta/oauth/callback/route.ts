import { NextResponse } from "next/server";

import { resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";
import {
  completeMetaOAuthConnection,
  verifyMetaOAuthState,
} from "@/integrations/meta/meta.oauth";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const appOrigin = `${url.protocol}//${url.host}`;
  const redirect = new URL("/integrations/meta/connect", appOrigin);

  if (oauthError) {
    redirect.searchParams.set("error", oauthError);
    return NextResponse.redirect(redirect);
  }

  const config = resolveMetaOAuthConfig();
  if (!config || !code || !state) {
    redirect.searchParams.set("error", "missing_code_or_config");
    return NextResponse.redirect(redirect);
  }

  try {
    const companyId = verifyMetaOAuthState(state, config);
    const auth = await authorizeCompanyRequest(companyId);
    if (!auth.ok) {
      redirect.searchParams.set("error", "company_access_denied");
      return NextResponse.redirect(redirect);
    }
    await completeMetaOAuthConnection(code, companyId, auth.user.id);
    redirect.searchParams.set("connected", "1");
    redirect.searchParams.set("companyId", companyId);
    return NextResponse.redirect(redirect);
  } catch (error) {
    const message = error instanceof Error ? error.message : "oauth_failed";
    redirect.searchParams.set("error", message.slice(0, 180));
    return NextResponse.redirect(redirect);
  }
}
