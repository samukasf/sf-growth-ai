import { createHmac, timingSafeEqual } from "node:crypto";

import { GmailApiError } from "./gmail.types";
import type { GoogleOAuthConfig, GoogleTokenResponse } from "./gmail.types";

const GOOGLE_OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_OAUTH_CALLBACK_PATH = "/api/integrations/google/oauth/callback";
const CANONICAL_PRODUCTION_ORIGIN = "https://sf-growth-ai.vercel.app";

/**
 * Uma única autorização Google alimenta as capacidades operacionais do Samuel.
 *
 * Workspace:
 * - Gmail: leitura, composição, envio, labels/arquivo/lixeira.
 * - Calendar: leitura e escrita de compromissos.
 * - Drive/Contacts: contexto e pesquisa.
 *
 * Local:
 * - Business Profile: gestão dos perfis/locais do Google Business.
 *
 * Maps Platform:
 * - Places e Geocoding ficam fora do consentimento OAuth de utilizador.
 * - Essas APIs devem usar credencial server-side própria do projeto Google Cloud
 *   (API key restrita ou autenticação de workload/service account), evitando
 *   bloquear o login Google com scopes de Maps que não pertencem ao fluxo 3LO.
 *
 * Marketing/Performance:
 * - Google Ads: contas e performance publicitária.
 * - Google Analytics: propriedades e métricas GA4.
 * - Search Console: propriedades, consultas e desempenho orgânico.
 * - YouTube: leitura dos canais ligados à conta autorizada.
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
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");

function normalizeProductionOrigin(value: string | undefined): string | null {
  const clean = value?.trim();
  if (!clean) return null;

  const candidate = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function resolveGoogleOAuthRedirectUri(): string {
  const configured = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ?? "";

  if (process.env.VERCEL_ENV === "production") {
    const productionOrigin =
      normalizeProductionOrigin(process.env.SF_GROWTH_AI_URL) ??
      normalizeProductionOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
      normalizeProductionOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
      normalizeProductionOrigin(configured) ??
      CANONICAL_PRODUCTION_ORIGIN;

    return new URL(GOOGLE_OAUTH_CALLBACK_PATH, `${productionOrigin}/`).toString();
  }

  return configured;
}

export function resolveGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const redirectUri = resolveGoogleOAuthRedirectUri();

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
