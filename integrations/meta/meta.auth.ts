import type { MetaClientConfig } from "./meta.types";

export type MetaOAuthConfig = {
  appId: string;
  appSecret: string;
  redirectUri: string;
};

export const META_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_read_user_content",
  "pages_manage_posts",
  "pages_manage_metadata",
  "instagram_basic",
  "instagram_manage_insights",
  "instagram_content_publish",
  "ads_read",
  "ads_management",
  "business_management",
].join(",");

export function resolveMetaGraphApiVersion(): string {
  const configured = process.env.META_GRAPH_API_VERSION?.trim();
  if (configured) return configured.startsWith("v") ? configured : `v${configured}`;
  return "v26.0";
}

function readStringMap(value: string | undefined): Record<string, string> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, item]) => typeof item === "string" && item.trim())
        .map(([key, item]) => [key, (item as string).trim()]),
    );
  } catch {
    return {};
  }
}

export function resolveMetaPageId(companyId?: string): string {
  const map = readStringMap(process.env.META_PAGE_MAP);
  if (companyId && map[companyId]) return map[companyId];
  return process.env.META_PAGE_ID ?? "";
}

export function resolveMetaAdAccountId(companyId?: string): string | undefined {
  const map = readStringMap(process.env.META_AD_ACCOUNT_MAP);
  if (companyId && map[companyId]) return map[companyId];
  const accountId = process.env.META_AD_ACCOUNT_ID;
  return accountId || undefined;
}

export function resolveMetaInstagramBusinessId(companyId?: string): string | undefined {
  const map = readStringMap(process.env.META_INSTAGRAM_BUSINESS_MAP);
  if (companyId && map[companyId]) return map[companyId];
  return process.env.META_INSTAGRAM_BUSINESS_ID || undefined;
}

function canUseLegacyEnvCredentials(companyId?: string) {
  if (!companyId) return true;
  const ownerCompanyId = process.env.META_OWNER_COMPANY_ID?.trim();
  if (ownerCompanyId && ownerCompanyId === companyId) return true;
  return Boolean(readStringMap(process.env.META_PAGE_MAP)[companyId]);
}

export function resolveMetaClientConfig(
  overrides?: Partial<MetaClientConfig>,
  companyId?: string,
): MetaClientConfig | null {
  const usingEnvAccessToken = !overrides?.accessToken;
  if (usingEnvAccessToken && !canUseLegacyEnvCredentials(companyId)) {
    return null;
  }

  const accessToken = overrides?.accessToken ?? process.env.META_ACCESS_TOKEN ?? "";
  const pageId = overrides?.pageId ?? resolveMetaPageId(companyId);

  if (!accessToken || !pageId) {
    return null;
  }

  return {
    accessToken,
    pageId,
    instagramBusinessId:
      overrides?.instagramBusinessId ?? resolveMetaInstagramBusinessId(companyId),
    adAccountId: overrides?.adAccountId ?? resolveMetaAdAccountId(companyId),
  };
}

export async function resolveMetaClientConfigForCompany(
  companyId: string,
): Promise<MetaClientConfig | null> {
  try {
    const { findMetaOAuthConnection } = await import("./meta-token.repository");
    const connection = await findMetaOAuthConnection(companyId);
    if (connection?.selectedExplicitly && connection.accessToken && connection.pageId) {
      return {
        accessToken: connection.accessToken,
        pageId: connection.pageId,
        instagramBusinessId: connection.instagramBusinessId ?? undefined,
        adAccountId: connection.adAccountId ?? undefined,
      };
    }
  } catch {
    // Fall through to the deliberately scoped legacy env fallback.
  }

  return resolveMetaClientConfig(undefined, companyId);
}

export function resolveMetaOAuthConfig(): MetaOAuthConfig | null {
  const appId = process.env.META_APP_ID ?? "";
  const appSecret = process.env.META_APP_SECRET ?? "";
  const redirectUri = process.env.META_OAUTH_REDIRECT_URI ?? "";

  if (!appId || !appSecret || !redirectUri) {
    return null;
  }

  return { appId, appSecret, redirectUri };
}

export function buildMetaOAuthAuthorizeUrl(state?: string): string | null {
  const oauth = resolveMetaOAuthConfig();
  if (!oauth) return null;

  const params = new URLSearchParams({
    client_id: oauth.appId,
    redirect_uri: oauth.redirectUri,
    scope: META_OAUTH_SCOPES,
    response_type: "code",
    ...(state ? { state } : {}),
  });

  return `https://www.facebook.com/${resolveMetaGraphApiVersion()}/dialog/oauth?${params.toString()}`;
}

export function isMetaTokenExpiredError(code?: number, message?: string): boolean {
  if (code === 190 || code === 102) return true;
  return /expired|invalid.*token|session.*invalid/i.test(message ?? "");
}
