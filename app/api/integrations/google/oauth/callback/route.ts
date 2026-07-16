import { NextResponse } from "next/server";

import {
  completeGmailOAuthConnection,
  resolveGoogleOAuthConfig,
  verifyGmailOAuthState,
} from "@/integrations/gmail";

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
    await completeGmailOAuthConnection(code, companyId);
    successRedirect.searchParams.set("connected", "1");
    successRedirect.searchParams.set("companyId", companyId);
    return NextResponse.redirect(successRedirect);
  } catch (error) {
    const message = error instanceof Error ? error.message : "oauth_failed";
    errorRedirect.searchParams.set("error", message.slice(0, 180));
    return NextResponse.redirect(errorRedirect);
  }
}
