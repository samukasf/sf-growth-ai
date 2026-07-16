import { NextResponse } from "next/server";

import { resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";
import {
  completeMetaOAuthConnection,
  verifyMetaOAuthState,
} from "@/integrations/meta/meta.oauth";

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
    await completeMetaOAuthConnection(code, companyId);
    redirect.searchParams.set("connected", "1");
    redirect.searchParams.set("companyId", companyId);
    return NextResponse.redirect(redirect);
  } catch (error) {
    const message = error instanceof Error ? error.message : "oauth_failed";
    redirect.searchParams.set("error", message.slice(0, 180));
    return NextResponse.redirect(redirect);
  }
}
