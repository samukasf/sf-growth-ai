import type { MetaClientConfig } from "./meta.types";

export type MetaOAuthConfig = {
  appId: string;
  appSecret: string;
  redirectUri: string;
};

const META_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_read_user_content",
  "instagram_basic",
  "instagram_manage_insights",
  "ads_read",
  "business_management",
].join(",");

export function resolveMetaPageId(companyId?: string): string {
  const mapJson = process.env.META_PAGE_MAP;
  if (companyId && mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (map[companyId]) return map[companyId];
    } catch {
      // ignore invalid JSON
    }
  }

  return process.env.META_PAGE_ID ?? "";
}

export function resolveMetaAdAccountId(companyId?: string): string | undefined {
  const mapJson = process.env.META_AD_ACCOUNT_MAP;
  if (companyId && mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (map[companyId]) return map[companyId];
    } catch {
      // ignore invalid JSON
    }
  }

  const accountId = process.env.META_AD_ACCOUNT_ID;
  return accountId || undefined;
}

export function resolveMetaInstagramBusinessId(): string | undefined {
  return process.env.META_INSTAGRAM_BUSINESS_ID || undefined;
}

export function resolveMetaClientConfig(
  overrides?: Partial<MetaClientConfig>,
  companyId?: string,
): MetaClientConfig | null {
  const accessToken = overrides?.accessToken ?? process.env.META_ACCESS_TOKEN ?? "";
  const pageId = overrides?.pageId ?? resolveMetaPageId(companyId);

  if (!accessToken || !pageId) {
    return null;
  }

  return {
    accessToken,
    pageId,
    instagramBusinessId:
      overrides?.instagramBusinessId ?? resolveMetaInstagramBusinessId(),
    adAccountId: overrides?.adAccountId ?? resolveMetaAdAccountId(companyId),
  };
}

/** Resolve config from env or from an already-loaded OAuth connection override. */
export async function resolveMetaClientConfigForCompany(
  companyId: string,
): Promise<MetaClientConfig | null> {
  const fromEnv = resolveMetaClientConfig(undefined, companyId);
  if (fromEnv) return fromEnv;

  try {
    const { findMetaOAuthConnection } = await import("./meta-token.repository");
    const connection = await findMetaOAuthConnection(companyId);
    if (!connection) return null;
    return resolveMetaClientConfig(
      {
        accessToken: connection.accessToken,
        pageId: connection.pageId,
      },
      companyId,
    );
  } catch {
    return null;
  }
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

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

export function isMetaTokenExpiredError(code?: number, message?: string): boolean {
  if (code === 190 || code === 102) return true;
  return /expired|invalid.*token|session.*invalid/i.test(message ?? "");
}
