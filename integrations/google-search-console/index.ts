export {
  GoogleSearchConsoleClient,
  resolveGoogleSearchConsoleSiteUrl,
} from "./google-search-console.client";

export {
  fetchGoogleSearchConsoleApiSnapshot,
  fetchSearchConsoleMetrics,
  buildSearchConsoleExecutiveForCompany,
  enrichMarketingWithSearchConsole,
  enrichIntelligenceWithSearchConsole,
  type SearchConsoleExecutiveEngines,
} from "./google-search-console.adapter";

export { mapSnapshotToMetrics } from "./google-search-console.mapper";

export {
  GoogleSearchConsoleApiError,
  type GoogleSearchConsoleApiSnapshot,
  type GoogleSearchConsoleClientConfig,
  type GoogleSearchConsoleConnection,
  type GoogleSearchConsoleConnectionMode,
  type GoogleSearchConsoleErrorCode,
  type GoogleSearchConsoleSearchPerformanceResponse,
  type GoogleSearchConsoleQueriesResponse,
  type GoogleSearchConsolePagesResponse,
  type GoogleSearchConsoleCountriesResponse,
  type GoogleSearchConsoleDevicesResponse,
  type GoogleSearchConsoleIndexCoverageResponse,
  type GoogleSearchConsoleSitemapsResponse,
  type GoogleSearchConsoleCoreWebVitalsResponse,
  type GoogleSearchConsoleSearchAppearanceResponse,
} from "./google-search-console.types";
