export type MetaErrorCode =
  | "RATE_LIMIT"
  | "TOKEN_EXPIRED"
  | "PAGE_NOT_FOUND"
  | "INSTAGRAM_NOT_LINKED"
  | "AUTH_ERROR"
  | "NOT_CONFIGURED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class MetaApiError extends Error {
  readonly code: MetaErrorCode;
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(
    code: MetaErrorCode,
    message: string,
    options?: { status?: number; retryAfterMs?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "MetaApiError";
    this.code = code;
    this.status = options?.status;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

export type MetaConnectionMode = "live" | "mock";

export type MetaClientConfig = {
  accessToken: string;
  pageId: string;
  instagramBusinessId?: string;
  adAccountId?: string;
};

export type MetaConnection = {
  connected: boolean;
  mode: MetaConnectionMode;
  pageId: string;
  pageName?: string;
  instagramBusinessId?: string;
  adAccountId?: string;
};

export type MetaFacebookPage = {
  id: string;
  name: string;
  followers: number;
  category?: string;
  instagramBusinessId?: string;
};

export type MetaInstagramBusiness = {
  id: string;
  username?: string;
  followers: number;
  mediaCount: number;
  linked: boolean;
};

export type MetaPost = {
  id: string;
  message?: string;
  platform: "facebook" | "instagram";
  createdTime?: string;
  reach: number;
  engagement: number;
  impressions: number;
  type?: "post" | "story" | "reel";
};

export type MetaPostsResponse = {
  posts: MetaPost[];
};

export type MetaInsightsResponse = {
  impressions: number;
  reach: number;
  engagement: number;
  profileViews: number;
};

export type MetaReachResponse = {
  facebookReach: number;
  instagramReach: number;
  totalReach: number;
};

export type MetaImpressionsResponse = {
  facebookImpressions: number;
  instagramImpressions: number;
  totalImpressions: number;
};

export type MetaEngagementResponse = {
  totalEngagement: number;
  comments: number;
  shares: number;
  saves: number;
  facebookEngagementRate: number;
  instagramEngagementRate: number;
};

export type MetaFollowersResponse = {
  facebookFollowers: number;
  instagramFollowers: number;
  totalFollowers: number;
  growthPercent: number;
};

export type MetaStoriesResponse = {
  stories: MetaPost[];
  totalReach: number;
};

export type MetaReelsResponse = {
  reels: MetaPost[];
  totalReach: number;
};

export type MetaAdsSummaryResponse = {
  spend: number;
  revenue: number;
  impressions: number;
  reach: number;
  clicks: number;
};

export type MetaCampaign = {
  id: string;
  name: string;
  status: string;
  objective?: string;
  spend: number;
};

export type MetaCampaignsResponse = {
  campaigns: MetaCampaign[];
};

export type MetaAdSet = {
  id: string;
  name: string;
  status: string;
  spend: number;
};

export type MetaAdSetsResponse = {
  adSets: MetaAdSet[];
};

export type MetaAd = {
  id: string;
  name: string;
  status: string;
  spend: number;
};

export type MetaAdsResponse = {
  ads: MetaAd[];
};

export type MetaRoasResponse = { roas: number; spend: number; revenue: number };
export type MetaCtrResponse = { ctr: number };
export type MetaCpmResponse = { cpm: number };
export type MetaCpcResponse = { cpc: number };
export type MetaConversionsResponse = { conversions: number; conversionRate: number };

export type MetaApiSnapshot = {
  facebookPage: MetaFacebookPage;
  instagramBusiness: MetaInstagramBusiness;
  posts: MetaPostsResponse;
  insights: MetaInsightsResponse;
  reach: MetaReachResponse;
  impressions: MetaImpressionsResponse;
  engagement: MetaEngagementResponse;
  followers: MetaFollowersResponse;
  stories: MetaStoriesResponse;
  reels: MetaReelsResponse;
  adsSummary: MetaAdsSummaryResponse;
  campaigns: MetaCampaignsResponse;
  adSets: MetaAdSetsResponse;
  ads: MetaAdsResponse;
  roas: MetaRoasResponse;
  ctr: MetaCtrResponse;
  cpm: MetaCpmResponse;
  cpc: MetaCpcResponse;
  conversions: MetaConversionsResponse;
};

export type MetaGraphResponse<T> = T & {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
};
