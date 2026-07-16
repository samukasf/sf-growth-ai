import { buildMetaCacheKey, getCached } from "./meta.cache";
import { isMetaTokenExpiredError, resolveMetaClientConfig } from "./meta.auth";
import type {
  MetaAdsResponse,
  MetaAdsSummaryResponse,
  MetaAdSetsResponse,
  MetaCampaign,
  MetaCampaignsResponse,
  MetaClientConfig,
  MetaConnection,
  MetaConversionsResponse,
  MetaCpcResponse,
  MetaCpmResponse,
  MetaCtrResponse,
  MetaEngagementResponse,
  MetaFacebookPage,
  MetaFollowersResponse,
  MetaGraphResponse,
  MetaImpressionsResponse,
  MetaInsightsResponse,
  MetaInstagramBusiness,
  MetaPost,
  MetaPostsResponse,
  MetaReachResponse,
  MetaReelsResponse,
  MetaRoasResponse,
  MetaStoriesResponse,
} from "./meta.types";
import { MetaApiError } from "./meta.types";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number.parseInt(header, 10);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  return undefined;
}

function mapGraphError(status: number, body: string, headers: Headers): never {
  const retryAfterMs = parseRetryAfterMs(headers.get("retry-after"));

  let parsed: { error?: { message?: string; code?: number; type?: string } } = {};
  try {
    parsed = JSON.parse(body) as typeof parsed;
  } catch {
    // ignore
  }

  const message = parsed.error?.message ?? body;
  const code = parsed.error?.code;

  if (status === 401 || isMetaTokenExpiredError(code, message)) {
    throw new MetaApiError(
      "TOKEN_EXPIRED",
      "Token de acesso da Meta Graph API expirado ou inválido.",
      { status },
    );
  }

  if (status === 403 || /permission|oauth/i.test(message)) {
    throw new MetaApiError(
      "AUTH_ERROR",
      "Permissões insuficientes para acessar a Meta Graph API.",
      { status },
    );
  }

  if (status === 404 || code === 803) {
    throw new MetaApiError(
      "PAGE_NOT_FOUND",
      "Página Meta não encontrada ou inacessível.",
      { status },
    );
  }

  if (status === 429 || code === 4 || code === 17) {
    throw new MetaApiError(
      "RATE_LIMIT",
      "Limite de requisições da Meta Graph API atingido.",
      { status, retryAfterMs },
    );
  }

  if (/instagram.*not.*linked|no instagram business account/i.test(message)) {
    throw new MetaApiError(
      "INSTAGRAM_NOT_LINKED",
      "Conta Instagram Business não vinculada à página Facebook.",
      { status },
    );
  }

  throw new MetaApiError(
    "UNKNOWN",
    `Erro na Meta Graph API (${status}): ${message}`,
    { status },
  );
}

function getMockFacebookPage(): MetaFacebookPage {
  return {
    id: "mock-page",
    name: "SF Growth AI",
    followers: 8420,
    category: "Business",
    instagramBusinessId: "mock-ig",
  };
}

function getMockInstagramBusiness(): MetaInstagramBusiness {
  return {
    id: "mock-ig",
    username: "sfgrowthai",
    followers: 15680,
    mediaCount: 248,
    linked: true,
  };
}

function getMockPosts(): MetaPostsResponse {
  return {
    posts: [
      {
        id: "post-1",
        message: "Case de sucesso — Cliente Enterprise",
        platform: "instagram",
        reach: 18500,
        engagement: 2840,
        impressions: 24200,
        type: "post",
      },
      {
        id: "post-2",
        message: "Live Q&A — Estratégia de Growth",
        platform: "facebook",
        reach: 12400,
        engagement: 1620,
        impressions: 15800,
        type: "post",
      },
      {
        id: "post-3",
        message: "Reels — Bastidores do time",
        platform: "instagram",
        reach: 22100,
        engagement: 1980,
        impressions: 28400,
        type: "reel",
      },
      {
        id: "post-w1",
        message: "Post institucional genérico",
        platform: "facebook",
        reach: 3200,
        engagement: 84,
        impressions: 4100,
        type: "post",
      },
      {
        id: "post-w2",
        message: "Promoção sem segmentação",
        platform: "instagram",
        reach: 4100,
        engagement: 120,
        impressions: 5200,
        type: "post",
      },
    ],
  };
}

function getMockInsights(): MetaInsightsResponse {
  return {
    impressions: 186500,
    reach: 73600,
    engagement: 12480,
    profileViews: 8420,
  };
}

function getMockReach(): MetaReachResponse {
  return { facebookReach: 28400, instagramReach: 45200, totalReach: 73600 };
}

function getMockImpressions(): MetaImpressionsResponse {
  return {
    facebookImpressions: 68400,
    instagramImpressions: 118100,
    totalImpressions: 186500,
  };
}

function getMockEngagement(): MetaEngagementResponse {
  return {
    totalEngagement: 12480,
    comments: 1840,
    shares: 920,
    saves: 640,
    facebookEngagementRate: 3.2,
    instagramEngagementRate: 5.8,
  };
}

function getMockFollowers(): MetaFollowersResponse {
  return {
    facebookFollowers: 8420,
    instagramFollowers: 15680,
    totalFollowers: 24100,
    growthPercent: 8.4,
  };
}

function getMockStories(): MetaStoriesResponse {
  return {
    stories: [
      {
        id: "story-1",
        message: "Stories — Oferta limitada",
        platform: "instagram",
        reach: 6200,
        engagement: 480,
        impressions: 7400,
        type: "story",
      },
    ],
    totalReach: 6200,
  };
}

function getMockReels(): MetaReelsResponse {
  return {
    reels: [
      {
        id: "reel-1",
        message: "Reels — Bastidores do time",
        platform: "instagram",
        reach: 22100,
        engagement: 1980,
        impressions: 28400,
        type: "reel",
      },
    ],
    totalReach: 22100,
  };
}

function getMockAdsSummary(): MetaAdsSummaryResponse {
  return {
    spend: 8400,
    revenue: 30240,
    impressions: 420000,
    reach: 186000,
    clicks: 3580,
  };
}

function getMockCampaigns(): MetaCampaignsResponse {
  return {
    campaigns: [
      { id: "camp-1", name: "Conversão — Leads B2B", status: "ACTIVE", objective: "LEADS", spend: 4200 },
      { id: "camp-2", name: "Remarketing — Site Visitors", status: "ACTIVE", objective: "CONVERSIONS", spend: 2800 },
    ],
  };
}

function getMockAdSets(): MetaAdSetsResponse {
  return {
    adSets: [
      { id: "adset-1", name: "Lookalike 1% — Compradores", status: "ACTIVE", spend: 2400 },
      { id: "adset-2", name: "Interesses — Growth Marketing", status: "ACTIVE", spend: 1800 },
    ],
  };
}

function getMockAds(): MetaAdsResponse {
  return {
    ads: [
      { id: "ad-1", name: "Carrossel — Case Enterprise", status: "ACTIVE", spend: 1200 },
      { id: "ad-2", name: "Vídeo — Demo Samuel AI", status: "ACTIVE", spend: 980 },
    ],
  };
}

function getMockRoas(): MetaRoasResponse {
  return { roas: 3.6, spend: 8400, revenue: 30240 };
}

function getMockCtr(): MetaCtrResponse {
  return { ctr: 2.35 };
}

function getMockCpm(): MetaCpmResponse {
  return { cpm: 12.4 };
}

function getMockCpc(): MetaCpcResponse {
  return { cpc: 1.82 };
}

function getMockConversions(): MetaConversionsResponse {
  return { conversions: 186, conversionRate: 5.2 };
}

export class MetaClient {
  private config: MetaClientConfig | null = null;
  private connection: MetaConnection | null = null;
  private useMock = false;
  private instagramId: string | null = null;

  constructor(private readonly overrides?: Partial<MetaClientConfig>) {}

  async connect(): Promise<MetaConnection> {
    const config = resolveMetaClientConfig(this.overrides);

    if (!config) {
      this.useMock = true;
      this.connection = {
        connected: true,
        mode: "mock",
        pageId: "mock-page",
        pageName: "Meta (Mock)",
      };
      return this.connection;
    }

    this.config = config;

    try {
      const page = await this.fetchGraph<{
        id?: string;
        name?: string;
        instagram_business_account?: { id?: string };
      }>(
        `/${config.pageId}`,
        {
          fields: "id,name,fan_count,instagram_business_account{id}",
        },
        config.accessToken,
      );

      this.instagramId =
        page.instagram_business_account?.id ?? config.instagramBusinessId ?? null;

      this.useMock = false;
      this.connection = {
        connected: true,
        mode: "live",
        pageId: page.id ?? config.pageId,
        pageName: page.name,
        instagramBusinessId: this.instagramId ?? undefined,
        adAccountId: config.adAccountId,
      };
    } catch (error) {
      if (error instanceof MetaApiError && error.code !== "NETWORK_ERROR") {
        throw error;
      }
      this.useMock = true;
      this.connection = {
        connected: true,
        mode: "mock",
        pageId: config.pageId,
        pageName: "Meta (Fallback Mock)",
      };
    }

    return this.connection;
  }

  async getFacebookPage(): Promise<MetaFacebookPage> {
    if (this.useMock) return getMockFacebookPage();

    const config = this.requireConfig();
    const data = await this.cachedFetch<{
      id?: string;
      name?: string;
      fan_count?: number;
      category?: string;
      instagram_business_account?: { id?: string };
    }>(`page:${config.pageId}`, `/${config.pageId}`, {
      fields: "id,name,fan_count,category,instagram_business_account{id}",
    });

    this.instagramId =
      data.instagram_business_account?.id ?? config.instagramBusinessId ?? null;

    return {
      id: data.id ?? config.pageId,
      name: data.name ?? "Facebook Page",
      followers: data.fan_count ?? 0,
      category: data.category,
      instagramBusinessId: this.instagramId ?? undefined,
    };
  }

  async getInstagramBusiness(): Promise<MetaInstagramBusiness> {
    if (this.useMock) return getMockInstagramBusiness();

    const config = this.requireConfig();
    const igId = this.instagramId ?? config.instagramBusinessId;

    if (!igId) {
      throw new MetaApiError(
        "INSTAGRAM_NOT_LINKED",
        "Conta Instagram Business não vinculada à página Facebook.",
      );
    }

    const data = await this.cachedFetch<{
      id?: string;
      username?: string;
      followers_count?: number;
      media_count?: number;
    }>(`ig:${igId}`, `/${igId}`, {
      fields: "id,username,followers_count,media_count",
    });

    return {
      id: data.id ?? igId,
      username: data.username,
      followers: data.followers_count ?? 0,
      mediaCount: data.media_count ?? 0,
      linked: true,
    };
  }

  async getPosts(): Promise<MetaPostsResponse> {
    if (this.useMock) return getMockPosts();

    const config = this.requireConfig();
    const data = await this.cachedFetch<{
      data?: Array<{
        id?: string;
        message?: string;
        created_time?: string;
        insights?: { data?: Array<{ name?: string; values?: Array<{ value?: number }> }> };
      }>;
    }>(`posts:${config.pageId}`, `/${config.pageId}/published_posts`, {
      fields: "id,message,created_time",
      limit: "10",
    });

    const posts: MetaPost[] = (data.data ?? []).map((post, index) => ({
      id: post.id ?? `post-${index}`,
      message: post.message,
      platform: "facebook" as const,
      createdTime: post.created_time,
      reach: 0,
      engagement: 0,
      impressions: 0,
      type: "post" as const,
    }));

    return { posts };
  }

  async getInsights(): Promise<MetaInsightsResponse> {
    if (this.useMock) return getMockInsights();
    const reach = await this.getReach();
    const impressions = await this.getImpressions();
    const engagement = await this.getEngagement();
    return {
      impressions: impressions.totalImpressions,
      reach: reach.totalReach,
      engagement: engagement.totalEngagement,
      profileViews: 0,
    };
  }

  async getReach(): Promise<MetaReachResponse> {
    if (this.useMock) return getMockReach();
    return this.fetchPageInsightMetrics(["page_impressions_unique"], {
      facebookReach: 0,
      instagramReach: 0,
      totalReach: 0,
    });
  }

  async getImpressions(): Promise<MetaImpressionsResponse> {
    if (this.useMock) return getMockImpressions();
    return this.fetchPageInsightMetrics(["page_impressions"], {
      facebookImpressions: 0,
      instagramImpressions: 0,
      totalImpressions: 0,
    });
  }

  async getEngagement(): Promise<MetaEngagementResponse> {
    if (this.useMock) return getMockEngagement();

    const config = this.requireConfig();
    try {
      const data = await this.cachedFetch<{
        data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
      }>(`engagement:${config.pageId}`, `/${config.pageId}/insights`, {
        metric: "page_post_engagements,page_engaged_users",
        period: "days_28",
      });

      const values = this.parseInsightValues(data.data ?? []);
      const totalEngagement = values.page_post_engagements ?? 0;
      const engagedUsers = values.page_engaged_users ?? 1;
      const facebookEngagementRate =
        Math.round((totalEngagement / Math.max(1, engagedUsers)) * 1000) / 10;

      return {
        totalEngagement,
        comments: Math.round(totalEngagement * 0.15),
        shares: Math.round(totalEngagement * 0.08),
        saves: Math.round(totalEngagement * 0.05),
        facebookEngagementRate,
        instagramEngagementRate: 0,
      };
    } catch {
      return {
        totalEngagement: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        facebookEngagementRate: 0,
        instagramEngagementRate: 0,
      };
    }
  }

  async getFollowers(): Promise<MetaFollowersResponse> {
    if (this.useMock) return getMockFollowers();

    const page = await this.getFacebookPage();
    let instagramFollowers = 0;

    try {
      const ig = await this.getInstagramBusiness();
      instagramFollowers = ig.followers;
    } catch (error) {
      if (
        error instanceof MetaApiError &&
        error.code === "INSTAGRAM_NOT_LINKED"
      ) {
        instagramFollowers = 0;
      } else {
        throw error;
      }
    }

    return {
      facebookFollowers: page.followers,
      instagramFollowers,
      totalFollowers: page.followers + instagramFollowers,
      growthPercent: 0,
    };
  }

  async getStories(): Promise<MetaStoriesResponse> {
    if (this.useMock) return getMockStories();
    return { stories: [], totalReach: 0 };
  }

  async getReels(): Promise<MetaReelsResponse> {
    if (this.useMock) return getMockReels();
    const posts = await this.getPosts();
    const reels = posts.posts.filter((post) => post.type === "reel");
    return reels.length > 0
      ? { reels, totalReach: reels.reduce((sum, reel) => sum + reel.reach, 0) }
      : { reels: [], totalReach: 0 };
  }

  async getAdsSummary(): Promise<MetaAdsSummaryResponse> {
    if (this.useMock) return getMockAdsSummary();
    return this.fetchAdInsights({ spend: 0, revenue: 0, impressions: 0, reach: 0, clicks: 0 });
  }

  async getCampaigns(): Promise<MetaCampaignsResponse> {
    if (this.useMock) return getMockCampaigns();

    const config = this.requireConfig();
    if (!config.adAccountId) return { campaigns: [] };

    const accountId = config.adAccountId.startsWith("act_")
      ? config.adAccountId
      : `act_${config.adAccountId}`;

    const data = await this.cachedFetch<{
      data?: Array<{
        id?: string;
        name?: string;
        status?: string;
        objective?: string;
        spend?: string;
      }>;
    }>(`campaigns:${accountId}`, `/${accountId}/campaigns`, {
      fields: "id,name,status,objective",
      limit: "10",
    });

    const campaigns: MetaCampaign[] = (data.data ?? []).map((campaign, index) => ({
      id: campaign.id ?? `camp-${index}`,
      name: campaign.name ?? "Campaign",
      status: campaign.status ?? "UNKNOWN",
      objective: campaign.objective,
      spend: Number.parseFloat(campaign.spend ?? "0") || 0,
    }));

    return { campaigns };
  }

  async getAdSets(): Promise<MetaAdSetsResponse> {
    if (this.useMock) return getMockAdSets();
    return { adSets: [] };
  }

  async getAds(): Promise<MetaAdsResponse> {
    if (this.useMock) return getMockAds();
    return { ads: [] };
  }

  async getROAS(): Promise<MetaRoasResponse> {
    if (this.useMock) return getMockRoas();
    const summary = await this.getAdsSummary();
    const revenue = summary.revenue;
    const spend = summary.spend;
    return {
      roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0,
      spend,
      revenue,
    };
  }

  async getCTR(): Promise<MetaCtrResponse> {
    if (this.useMock) return getMockCtr();
    const summary = await this.getAdsSummary();
    const ctr =
      summary.impressions > 0
        ? Math.round((summary.clicks / summary.impressions) * 10000) / 100
        : 0;
    return { ctr };
  }

  async getCPM(): Promise<MetaCpmResponse> {
    if (this.useMock) return getMockCpm();
    const summary = await this.getAdsSummary();
    const cpm =
      summary.impressions > 0
        ? Math.round((summary.spend / summary.impressions) * 1000 * 100) / 100
        : 0;
    return { cpm };
  }

  async getCPC(): Promise<MetaCpcResponse> {
    if (this.useMock) return getMockCpc();
    const summary = await this.getAdsSummary();
    const cpc =
      summary.clicks > 0
        ? Math.round((summary.spend / summary.clicks) * 100) / 100
        : 0;
    return { cpc };
  }

  async getConversions(): Promise<MetaConversionsResponse> {
    if (this.useMock) return getMockConversions();
    return { conversions: 0, conversionRate: 0 };
  }

  private requireConfig(): MetaClientConfig {
    if (!this.config) {
      const resolved = resolveMetaClientConfig(this.overrides);
      if (!resolved) {
        this.useMock = true;
        throw new MetaApiError(
          "NOT_CONFIGURED",
          "Integração Meta não configurada.",
        );
      }
      this.config = resolved;
    }
    return this.config;
  }

  private async fetchPageInsightMetrics<T>(
    metrics: string[],
    fallback: T,
  ): Promise<T> {
    const config = this.requireConfig();
    try {
      const data = await this.cachedFetch<{
        data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
      }>(`insights:${config.pageId}:${metrics.join(",")}`, `/${config.pageId}/insights`, {
        metric: metrics.join(","),
        period: "days_28",
      });

      const values = this.parseInsightValues(data.data ?? []);
      const facebookValue = Object.values(values)[0] ?? 0;

      if (metrics[0]?.includes("impressions") && !metrics[0]?.includes("unique")) {
        return {
          facebookImpressions: facebookValue,
          instagramImpressions: 0,
          totalImpressions: facebookValue,
        } as T;
      }

      return {
        facebookReach: facebookValue,
        instagramReach: 0,
        totalReach: facebookValue,
      } as T;
    } catch {
      return fallback;
    }
  }

  private async fetchAdInsights(fallback: MetaAdsSummaryResponse): Promise<MetaAdsSummaryResponse> {
    const config = this.requireConfig();
    if (!config.adAccountId) return fallback;

    const accountId = config.adAccountId.startsWith("act_")
      ? config.adAccountId
      : `act_${config.adAccountId}`;

    try {
      const data = await this.cachedFetch<{
        data?: Array<{
          impressions?: string;
          reach?: string;
          clicks?: string;
          spend?: string;
          action_values?: Array<{ action_type?: string; value?: string }>;
        }>;
      }>(`ads:${accountId}`, `/${accountId}/insights`, {
        fields: "impressions,reach,clicks,spend,action_values",
        date_preset: "last_28d",
      });

      const row = data.data?.[0];
      if (!row) return fallback;

      const spend = Number.parseFloat(row.spend ?? "0") || 0;
      const purchaseValue =
        row.action_values?.find((action) => action.action_type === "purchase")?.value ?? "0";
      const revenue = Number.parseFloat(purchaseValue) || 0;

      return {
        spend,
        revenue,
        impressions: Number.parseInt(row.impressions ?? "0", 10) || 0,
        reach: Number.parseInt(row.reach ?? "0", 10) || 0,
        clicks: Number.parseInt(row.clicks ?? "0", 10) || 0,
      };
    } catch {
      return fallback;
    }
  }

  private parseInsightValues(
    data: Array<{ name?: string; values?: Array<{ value?: number }> }>,
  ): Record<string, number> {
    const result: Record<string, number> = {};
    for (const metric of data) {
      if (!metric.name) continue;
      const value = metric.values?.[metric.values.length - 1]?.value ?? 0;
      result[metric.name] = value;
    }
    return result;
  }

  private async cachedFetch<T>(
    cacheKey: string,
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const config = this.requireConfig();
    return getCached(buildMetaCacheKey([cacheKey, config.pageId]), () =>
      this.fetchGraph<T>(path, params, config.accessToken),
    );
  }

  private async fetchGraph<T>(
    path: string,
    params: Record<string, string>,
    accessToken: string,
  ): Promise<T> {
    const searchParams = new URLSearchParams({ ...params, access_token: accessToken });
    const url = `${GRAPH_API_BASE}${path}?${searchParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const body = await response.text();

      if (!response.ok) {
        mapGraphError(response.status, body, response.headers);
      }

      const json = JSON.parse(body) as MetaGraphResponse<T>;
      if (json.error) {
        mapGraphError(response.status || 400, body, response.headers);
      }

      return json as T;
    } catch (error) {
      if (error instanceof MetaApiError) throw error;
      throw new MetaApiError(
        "NETWORK_ERROR",
        "Falha de rede ao consultar Meta Graph API.",
        { cause: error },
      );
    }
  }
}
