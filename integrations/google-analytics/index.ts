export {
  GoogleAnalyticsClient,
  resolveGoogleAnalyticsPropertyId,
} from "./google-analytics.client";

export {
  fetchGoogleAnalyticsApiSnapshot,
  fetchGoogleAnalyticsMetrics,
  buildGoogleAnalyticsExecutiveForCompany,
  enrichMarketingWithAnalytics,
  enrichIntelligenceWithAnalytics,
  type GoogleAnalyticsExecutiveEngines,
} from "./google-analytics.adapter";

export { mapSnapshotToMetrics } from "./google-analytics.mapper";

export {
  GoogleAnalyticsApiError,
  type GoogleAnalyticsApiSnapshot,
  type GoogleAnalyticsClientConfig,
  type GoogleAnalyticsConnection,
  type GoogleAnalyticsErrorCode,
  type GoogleAnalyticsTrafficResponse,
  type GoogleAnalyticsUsersResponse,
  type GoogleAnalyticsSessionsResponse,
  type GoogleAnalyticsConversionsResponse,
  type GoogleAnalyticsRealtimeResponse,
  type GoogleAnalyticsTopPagesResponse,
  type GoogleAnalyticsChannelsResponse,
  type GoogleAnalyticsDevicesResponse,
  type GoogleAnalyticsCountriesResponse,
  type GoogleAnalyticsEventsResponse,
  type GoogleAnalyticsDimensionRow,
} from "./google-analytics.types";
