import { NextResponse } from "next/server";

import {
  GmailApiError,
  completeGmailOAuthConnection,
  resolveGoogleOAuthConfig,
  verifyGmailOAuthState,
} from "@/integrations/gmail";

function describeCallbackError(error: unknown): {
  code: string;
  message: string;
  stack?: string;
  cause?: string;
} {
  if (error instanceof GmailApiError) {
    const cause = error.cause;
    return {
      code: error.code,
      message: error.message,
      stack: error.stack,
      cause:
        cause instanceof Error
          ? cause.message
          : cause && typeof cause === "object" && "message" in cause
            ? String((cause as { message: unknown }).message)
            : cause
              ? String(cause)
              : undefined,
    };
  }

  if (error instanceof Error) {
    const cause = error.cause;
    return {
      code: "unknown",
      message: error.message,
      stack: error.stack,
      cause:
        cause instanceof Error
          ? cause.message
          : cause
            ? String(cause)
            : undefined,
    };
  }

  return { code: "unknown", message: String(error) };
}

/**
 * Callback do consentimento OAuth do Gmail (Sprint 86). O Google redireciona
 * para aqui após o usuário aprovar ou negar o acesso.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const redirectTo = (params: Record<string, string>) =>
    NextResponse.redirect(`${origin}/debug/gmail-connect?${new URLSearchParams(params).toString()}`);

  const oauthError = searchParams.get("error");
  if (oauthError) {
    return redirectTo({ connected: "false", error: oauthError });
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return redirectTo({ connected: "false", error: "missing_code_or_state" });
  }

  try {
    const config = resolveGoogleOAuthConfig();
    if (!config) {
      return redirectTo({ connected: "false", error: "not_configured" });
    }

    const companyId = verifyGmailOAuthState(state, config);
    const connection = await completeGmailOAuthConnection(code, companyId);

    return redirectTo({
      connected: "true",
      companyId,
      email: connection.googleEmail ?? "",
    });
  } catch (error) {
    const details = describeCallbackError(error);

    console.error("[gmail-oauth-callback] Falha ao concluir conexão:", {
      code: details.code,
      message: details.message,
      cause: details.cause,
      stack: details.stack,
    });

    const params: Record<string, string> = {
      connected: "false",
      error: details.code,
    };

    if (process.env.NODE_ENV === "development") {
      params.errorMessage = details.message.slice(0, 500);
      if (details.cause) {
        params.errorCause = details.cause.slice(0, 300);
      }
    }

    return redirectTo(params);
  }
}
