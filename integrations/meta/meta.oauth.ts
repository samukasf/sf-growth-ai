import { createHmac, timingSafeEqual } from "node:crypto";

import {
  resolveMetaOAuthConfig,
  type MetaOAuthConfig,
} from "./meta.auth";
import { upsertMetaOAuthConnection } from "./meta-token.repository";
import { MetaApiError } from "./meta.types";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

export function signMetaOAuthState(companyId: string, config: MetaOAuthConfig): string {
  const payload = Buffer.from(
    JSON.stringify({ companyId, issuedAt: Date.now() }),
  ).toString("base64url");
  const signature = createHmac("sha256", config.appSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyMetaOAuthState(state: string, config: MetaOAuthConfig): string {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) {
    throw new MetaApiError("AUTH_ERROR", "Parâmetro state do OAuth Meta ausente ou malformado.");
  }

  const expected = createHmac("sha256", config.appSecret).update(payload).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new MetaApiError("AUTH_ERROR", "Assinatura do state do OAuth Meta inválida.");
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
      throw new Error("state inválido");
    }
    return decoded.companyId;
  } catch (error) {
    throw new MetaApiError("AUTH_ERROR", "Não foi possível decodificar o state do OAuth Meta.", {
      cause: error,
    });
  }
}

export function buildSignedMetaOAuthAuthorizeUrl(companyId: string): string {
  const config = resolveMetaOAuthConfig();
  if (!config) {
    throw new MetaApiError(
      "NOT_CONFIGURED",
      "Meta OAuth não configurado (META_APP_ID/META_APP_SECRET/META_OAUTH_REDIRECT_URI).",
    );
  }

  const state = signMetaOAuthState(companyId, config);
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_read_user_content",
      "instagram_basic",
      "instagram_manage_insights",
      "ads_read",
      "business_management",
    ].join(","),
    response_type: "code",
    state,
  });

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

type MetaTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

async function exchangeCodeForUserToken(
  code: string,
  config: MetaOAuthConfig,
): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  const response = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params}`, {
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new MetaApiError(
      "AUTH_ERROR",
      `Falha ao trocar code Meta por token: ${text}`,
      { status: response.status },
    );
  }

  return JSON.parse(text) as MetaTokenResponse;
}

async function exchangeForLongLivedToken(
  shortLivedToken: string,
  config: MetaOAuthConfig,
): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params}`, {
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    // Keep short-lived token if long-lived exchange fails.
    return { access_token: shortLivedToken };
  }

  return JSON.parse(text) as MetaTokenResponse;
}

type MetaPageAccount = {
  id: string;
  name?: string;
  access_token?: string;
};

async function listManagedPages(userAccessToken: string): Promise<MetaPageAccount[]> {
  const response = await fetch(
    `${GRAPH_API_BASE}/me/accounts?fields=id,name,access_token&limit=25&access_token=${encodeURIComponent(userAccessToken)}`,
    { cache: "no-store" },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new MetaApiError(
      "AUTH_ERROR",
      `Falha ao listar páginas Meta: ${text}`,
      { status: response.status },
    );
  }

  const payload = JSON.parse(text) as { data?: MetaPageAccount[] };
  return payload.data ?? [];
}

/**
 * Completa o OAuth Meta: code → user token → long-lived → page token persistido.
 */
export async function completeMetaOAuthConnection(
  code: string,
  companyId: string,
  connectedBy?: string | null,
) {
  const config = resolveMetaOAuthConfig();
  if (!config) {
    throw new MetaApiError("NOT_CONFIGURED", "Meta OAuth não configurado.");
  }

  const shortLived = await exchangeCodeForUserToken(code, config);
  const longLived = await exchangeForLongLivedToken(shortLived.access_token, config);
  const pages = await listManagedPages(longLived.access_token);

  if (pages.length === 0) {
    throw new MetaApiError(
      "PAGE_NOT_FOUND",
      "Nenhuma página Facebook foi encontrada na conta autorizada.",
    );
  }

  const preferredPageId = process.env.META_PAGE_ID;
  const page =
    pages.find((item) => item.id === preferredPageId) ??
    pages.find((item) => Boolean(item.access_token)) ??
    pages[0];

  if (!page.access_token) {
    throw new MetaApiError(
      "AUTH_ERROR",
      "A página selecionada não devolveu page access token.",
    );
  }

  const expiresAt =
    typeof longLived.expires_in === "number"
      ? new Date(Date.now() + longLived.expires_in * 1000).toISOString()
      : null;

  return upsertMetaOAuthConnection({
    companyId,
    pageId: page.id,
    pageName: page.name ?? null,
    accessToken: page.access_token,
    tokenType: longLived.token_type ?? shortLived.token_type ?? "bearer",
    expiresAt,
    scopes: null,
    connectedBy: connectedBy ?? null,
  });
}
