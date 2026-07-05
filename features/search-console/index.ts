export {
  buildSearchConsoleExecutive,
  type SearchConsoleExecutive,
  type SearchConsoleExecutiveInput,
  type SearchConsoleMetrics,
  type SearchConsoleInsightItem,
  type SearchConsoleRecommendation,
  type SearchConsoleQueryMetric,
  type SearchConsolePageMetric,
  type SearchConsoleKeywordOpportunity,
  type SearchConsoleIndexingIssue,
  type SearchConsoleCoreWebVital,
} from "./services/search-console-executive.service";

export {
  buildSearchConsoleExecutiveForCompany,
  fetchSearchConsoleMetrics,
  fetchGoogleSearchConsoleApiSnapshot,
  enrichMarketingWithSearchConsole,
  enrichIntelligenceWithSearchConsole,
  GoogleSearchConsoleClient,
  GoogleSearchConsoleApiError,
  mapSnapshotToMetrics,
  resolveGoogleSearchConsoleSiteUrl,
  type GoogleSearchConsoleApiSnapshot,
  type SearchConsoleExecutiveEngines,
} from "@/integrations/google-search-console";

export { SearchConsoleExecutiveSummarySection } from "./components/search-console-executive-summary-section";
