import "server-only";

import { resolveGmailAccessToken } from "@/integrations/gmail";

const GOOGLE_ADS_API_VERSION = process.env.GOOGLE_ADS_API_VERSION?.trim() || "v25";

export type GoogleMarketingCheck<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number | null };

export type GoogleAdsAccount = {
  resourceName: string;
  customerId: string;
};

export type GoogleAnalyticsAccountSummary = {
  account: string;
  displayName: string;
  properties: Array<{
    property: string;
    displayName: string;
    propertyType: string | null;
  }>;
};

export type GoogleSearchConsoleSite = {
  siteUrl: string;
  permissionLevel: string | null;
};

export type GoogleYouTubeChannel = {
  id: string;
  title: string;
  customUrl: string | null;
  subscribers: number | null;
  views: number | null;
  videos: number | null;
};

export type GoogleMarketingOverview = {
  ads: GoogleMarketingCheck<{ accounts: GoogleAdsAccount[] }>;
  analytics: GoogleMarketingCheck<{ accounts: GoogleAnalyticsAccountSummary[] }>;
  searchConsole: GoogleMarketingCheck<{ sites: GoogleSearchConsoleSite[] }>;
  youtube: GoogleMarketingCheck<{ channels: GoogleYouTubeChannel[] }>;
};

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function googleJson<T>(
  url: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<GoogleMarketingCheck<T>> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
    const text = await response.text();
    if (!response.ok) {
      let providerMessage = text;
      try {
        const payload = JSON.parse(text) as { error?: { message?: string }; message?: string };
        providerMessage = payload.error?.message || payload.message || text;
      } catch {
        // Mantém a resposta textual do Google quando não houver JSON válido.
      }
      return {
        ok: false,
        status: response.status,
        error: providerMessage.slice(0, 500) || `Google API respondeu ${response.status}`,
      };
    }
    return { ok: true, data: JSON.parse(text) as T };
  } catch (error) {
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : "Falha de rede ao consultar Google.",
    };
  }
}

export async function listGoogleAdsAccounts(
  companyId: string,
): Promise<GoogleMarketingOverview["ads"]> {
  const accessToken = await resolveGmailAccessToken(companyId);
  const headers: Record<string, string> = {};
  const legacyDeveloperToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  if (legacyDeveloperToken) headers["developer-token"] = legacyDeveloperToken;

  const result = await googleJson<{ resourceNames?: string[] }>(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
    accessToken,
    { headers },
  );
  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      accounts: (result.data.resourceNames ?? []).map((resourceName) => ({
        resourceName,
        customerId: resourceName.replace(/^customers\//, ""),
      })),
    },
  };
}

export async function listGoogleAnalyticsAccounts(
  companyId: string,
): Promise<GoogleMarketingOverview["analytics"]> {
  const accessToken = await resolveGmailAccessToken(companyId);
  const result = await googleJson<{
    accountSummaries?: Array<{
      account?: string;
      displayName?: string;
      propertySummaries?: Array<{
        property?: string;
        displayName?: string;
        propertyType?: string;
      }>;
    }>;
  }>(
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200",
    accessToken,
  );
  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      accounts: (result.data.accountSummaries ?? [])
        .filter((account) => Boolean(account.account))
        .map((account) => ({
          account: account.account as string,
          displayName: account.displayName ?? account.account ?? "Google Analytics",
          properties: (account.propertySummaries ?? [])
            .filter((property) => Boolean(property.property))
            .map((property) => ({
              property: property.property as string,
              displayName: property.displayName ?? property.property ?? "GA4",
              propertyType: property.propertyType ?? null,
            })),
        })),
    },
  };
}

export async function listGoogleSearchConsoleSites(
  companyId: string,
): Promise<GoogleMarketingOverview["searchConsole"]> {
  const accessToken = await resolveGmailAccessToken(companyId);
  const result = await googleJson<{
    siteEntry?: Array<{ siteUrl?: string; permissionLevel?: string }>;
  }>("https://www.googleapis.com/webmasters/v3/sites", accessToken);
  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      sites: (result.data.siteEntry ?? [])
        .filter((site) => Boolean(site.siteUrl))
        .map((site) => ({
          siteUrl: site.siteUrl as string,
          permissionLevel: site.permissionLevel ?? null,
        })),
    },
  };
}

export async function listGoogleYouTubeChannels(
  companyId: string,
): Promise<GoogleMarketingOverview["youtube"]> {
  const accessToken = await resolveGmailAccessToken(companyId);
  const params = new URLSearchParams({
    part: "snippet,statistics",
    mine: "true",
    maxResults: "50",
  });
  const result = await googleJson<{
    items?: Array<{
      id?: string;
      snippet?: { title?: string; customUrl?: string };
      statistics?: {
        subscriberCount?: string;
        viewCount?: string;
        videoCount?: string;
      };
    }>;
  }>(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`, accessToken);
  if (!result.ok) return result;

  return {
    ok: true,
    data: {
      channels: (result.data.items ?? [])
        .filter((channel) => Boolean(channel.id))
        .map((channel) => ({
          id: channel.id as string,
          title: channel.snippet?.title ?? "Canal YouTube",
          customUrl: channel.snippet?.customUrl ?? null,
          subscribers: parseNumber(channel.statistics?.subscriberCount),
          views: parseNumber(channel.statistics?.viewCount),
          videos: parseNumber(channel.statistics?.videoCount),
        })),
    },
  };
}

async function safeCheck<T>(operation: () => Promise<GoogleMarketingCheck<T>>): Promise<GoogleMarketingCheck<T>> {
  try {
    return await operation();
  } catch (error) {
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : "Falha ao validar integração Google.",
    };
  }
}

export async function getGoogleMarketingOverview(companyId: string): Promise<GoogleMarketingOverview> {
  const [ads, analytics, searchConsole, youtube] = await Promise.all([
    safeCheck(() => listGoogleAdsAccounts(companyId)),
    safeCheck(() => listGoogleAnalyticsAccounts(companyId)),
    safeCheck(() => listGoogleSearchConsoleSites(companyId)),
    safeCheck(() => listGoogleYouTubeChannels(companyId)),
  ]);

  return { ads, analytics, searchConsole, youtube };
}
