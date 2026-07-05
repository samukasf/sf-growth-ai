export {
  buildMetaExecutive,
  type MetaExecutive,
  type MetaExecutiveInput,
  type MetaPlatformMetrics,
  type MetaPostPerformance,
  type MetaInsightItem,
  type MetaRecommendation,
} from "./services/meta-executive.service";

export {
  buildMetaExecutiveForCompany,
  fetchMetaMetrics,
  fetchMetaApiSnapshot,
  enrichMarketingWithMeta,
  enrichIntelligenceWithMeta,
  MetaClient,
  MetaApiError,
  mapSnapshotToMetrics,
  resolveMetaPageId,
  buildMetaOAuthAuthorizeUrl,
  clearMetaCache,
  type MetaApiSnapshot,
  type MetaExecutiveEngines,
} from "@/integrations/meta";

export { MetaExecutiveSummarySection } from "./components/meta-executive-summary-section";
