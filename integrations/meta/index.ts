export { MetaClient } from "./meta.client";

export {
  fetchMetaApiSnapshot,
  fetchMetaMetrics,
  buildMetaExecutiveForCompany,
  enrichMarketingWithMeta,
  enrichIntelligenceWithMeta,
  type MetaExecutiveEngines,
} from "./meta.adapter";

export { mapSnapshotToMetrics, type MetaMappedData } from "./meta.mapper";

export {
  resolveMetaClientConfig,
  resolveMetaClientConfigForCompany,
  resolveMetaPageId,
  resolveMetaAdAccountId,
  resolveMetaInstagramBusinessId,
  resolveMetaOAuthConfig,
  buildMetaOAuthAuthorizeUrl,
  isMetaTokenExpiredError,
  type MetaOAuthConfig,
} from "./meta.auth";

export {
  buildSignedMetaOAuthAuthorizeUrl,
  completeMetaOAuthConnection,
  signMetaOAuthState,
  verifyMetaOAuthState,
} from "./meta.oauth";

export {
  findMetaOAuthConnection,
  upsertMetaOAuthConnection,
  type MetaOAuthConnection,
} from "./meta-token.repository";

export {
  buildMetaCacheKey,
  getCached,
  setCached,
  clearMetaCache,
  invalidateMetaCache,
} from "./meta.cache";

export {
  MetaApiError,
  type MetaApiSnapshot,
  type MetaClientConfig,
  type MetaConnection,
  type MetaConnectionMode,
  type MetaErrorCode,
  type MetaFacebookPage,
  type MetaInstagramBusiness,
  type MetaPost,
  type MetaPostsResponse,
  type MetaInsightsResponse,
  type MetaReachResponse,
  type MetaImpressionsResponse,
  type MetaEngagementResponse,
  type MetaFollowersResponse,
  type MetaStoriesResponse,
  type MetaReelsResponse,
  type MetaAdsSummaryResponse,
  type MetaCampaignsResponse,
  type MetaAdSetsResponse,
  type MetaAdsResponse,
  type MetaRoasResponse,
  type MetaCtrResponse,
  type MetaCpmResponse,
  type MetaCpcResponse,
  type MetaConversionsResponse,
} from "./meta.types";
