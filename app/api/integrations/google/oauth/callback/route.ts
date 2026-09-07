import { NextResponse } from "next/server";

import {
  completeGmailOAuthConnection,
  resolveGoogleOAuthConfig,
  verifyGmailOAuthState,
} from "@/integrations/gmail";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const appOrigin = `${url.protocol}//${url.host}`;
  const successRedirect = new URL("/integrations/google/connect", appOrigin);
  const errorRedirect = new URL("/integrations/google/connect", appOrigin);

  if (oauthError) {
    errorRedirect.searchParams.set("error", oauthError);
    return NextResponse.redirect(errorRedirect);
  }

  const config = resolveGoogleOAuthConfig();
  if (!config || !code || !state) {
    errorRedirect.searchParams.set("error", "missing_code_or_config");
    return NextResponse.redirect(errorRedirect);
  }

  try {
    const companyId = verifyGmailOAuthState(state, config);
    const auth = await authorizeCompanyRequest(companyId);
    if (!auth.ok) {
      errorRedirect.searchParams.set("error", "company_access_denied");
      return NextResponse.redirect(errorRedirect);
    }
    await completeGmailOAuthConnection(code, companyId, auth.user.id);
    successRedirect.searchParams.set("connected", "1");
    successRedirect.searchParams.set("companyId", companyId);
    return NextResponse.redirect(successRedirect);
  } catch (error) {
    const message = error instanceof Error ? error.message : "oauth_failed";
    errorRedirect.searchParams.set("error", message.slice(0, 180));
    return NextResponse.redirect(errorRedirect);
  }
}
