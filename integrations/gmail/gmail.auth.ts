import { createHmac, timingSafeEqual } from "node:crypto";

import { GmailApiError } from "./gmail.types";
import type { GoogleOAuthConfig, GoogleTokenResponse } from "./gmail.types";

const GOOGLE_OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

/**
 * Uma única autorização Google alimenta as capacidades operacionais do Samuel.
 *
 * Workspace:
 * - Gmail: leitura, composição, envio, labels/arquivo/lixeira.
 * - Calendar: leitura e escrita de compromissos.
 * - Drive/Contacts: contexto e pesquisa.
 *
 * Local/Maps:
 * - Business Profile: gestão dos perfis/locais do Google Business.
 * - Places: pesquisa de empresas/locais para prospecção e contexto.
 * - Geocoding: endereços/coordenadas para rotas e contexto geográfico.
 *
 * Contas ligadas antes da inclusão de novos scopes devem usar "Reconectar Google"
 * para conceder as permissões adicionais.
 */
export const GMAIL_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/contacts.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/maps-platform.places",
  "https://www.googleapis.com/auth/maps-platform.geocode",
].join(" ");

export function resolveGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "";

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

export function signGmailOAuthState(companyId: string, config: GoogleOAuthConfig): string {
  const payload = Buffer.from(
    JSON.stringify({ companyId, issuedAt: Date.now() }),
  ).toString("base64url");
  const signature = createHmac("sha256", config.clientSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyGmailOAuthState(state: string, config: GoogleOAuthConfig): string {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) {
    throw new GmailApiError("INVALID_STATE", "Parâmetro state do OAuth ausente ou malformado.");
  }

  const expectedSignature = createHmac("sha256", config.clientSecret)
    .update(payload)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new GmailApiError("INVALID_STATE", "Assinatura do state do OAuth inválida.");
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      companyId?: string;
      issuedAt?: number;
    };
    const maximumAgeMs = 10 * 60 * 1000;
    if (
      !decoded.companyId ||
      !decoded.issuedAt ||
      Date.now() - decoded.issuedAt > maximumAgeMs ||
      decoded.issuedAt > Date.now() + 60_000
    ) {
      throw new Error("state ausente, expirado ou inválido");
    }
    return decoded.companyId;
  } catch (error) {
    throw new GmailApiError("INVALID_STATE", "Não foi possível decodificar o state do OAuth.", {
      cause: error,
    });
  }
}

export function buildGmailOAuthAuthorizeUrl(companyId: string): string {
  const config = resolveGoogleOAuthConfig();
  if (!config) {
    throw new GmailApiError(
      "NOT_CONFIGURED",
      "Integração Google não configurada (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_OAUTH_REDIRECT_URI ausentes).",
    );
  }

  const state = signGmailOAuthState(companyId, config);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GMAIL_OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

async function requestGoogleToken(body: URLSearchParams): Promise<GoogleTokenResponse> {
  let response: Response;
  try {
    response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch (error) {
    throw new GmailApiError("NETWORK_ERROR", "Falha de rede ao contatar o Google OAuth.", {
      cause: error,
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new GmailApiError(
      "TOKEN_EXCHANGE_FAILED",
      `Falha ao obter token do Google (status ${response.status}): ${text}`,
      { status: response.status },
    );
  }

  return (await response.json()) as GoogleTokenResponse;
}

export function exchangeGmailAuthorizationCode(
  code: string,
  config: GoogleOAuthConfig,
): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });

  return requestGoogleToken(body);
}

export async function refreshGmailAccessToken(
  refreshToken: string,
  config: GoogleOAuthConfig,
): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
  });

  try {
    return await requestGoogleToken(body);
  } catch (error) {
    if (error instanceof GmailApiError) {
      throw new GmailApiError(
        "TOKEN_REFRESH_FAILED",
        "Falha ao renovar access_token do Google — pode ser necessário reconectar a conta.",
        { status: error.status, cause: error },
      );
    }
    throw error;
  }
}
