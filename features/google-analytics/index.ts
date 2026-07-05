export {
  buildGoogleAnalyticsExecutive,
  type GoogleAnalyticsExecutive,
  type GoogleAnalyticsExecutiveInput,
  type GoogleAnalyticsMetrics,
  type GoogleAnalyticsInsightItem,
  type GoogleAnalyticsRecommendation,
  type GoogleAnalyticsChannelMetric,
  type GoogleAnalyticsPageMetric,
  type GoogleAnalyticsEventMetric,
} from "./services/google-analytics-executive.service";

export {
  buildGoogleAnalyticsExecutiveForCompany,
  fetchGoogleAnalyticsMetrics,
  fetchGoogleAnalyticsApiSnapshot,
  enrichMarketingWithAnalytics,
  enrichIntelligenceWithAnalytics,
  GoogleAnalyticsClient,
  GoogleAnalyticsApiError,
  mapSnapshotToMetrics,
  resolveGoogleAnalyticsPropertyId,
  type GoogleAnalyticsApiSnapshot,
  type GoogleAnalyticsExecutiveEngines,
} from "@/integrations/google-analytics";

export { GoogleAnalyticsExecutiveSummarySection } from "./components/google-analytics-executive-summary-section";
