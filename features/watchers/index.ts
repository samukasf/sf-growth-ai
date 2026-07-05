export type {
  ExecutiveWatcher,
  WatcherSignal,
  WatcherAlert,
  WatcherSource,
  WatcherSeverity,
  WatcherFrequency,
  WatcherStatus,
  WatcherRecommendation,
  WatcherCategory,
  WatcherExecutive,
  WatcherSummary,
  WatcherCoreInput,
  RunWatcherResult,
  WatcherScheduleConfig,
} from "./types/watcher.types";

export {
  WATCHER_CATEGORIES,
  CATEGORY_LABELS,
  MOCK_EXECUTIVE_WATCHERS,
} from "./constants/watcher.constants";

export {
  calculateWatcherPriority,
  calculateSignalDeviation,
  sortAlertsByPriority,
  deriveSeverityFromSignal,
} from "./utils/watcher-priority";

export {
  runWatcher,
  evaluateSignal,
  createWatcherAlert,
  getActiveWatchers,
  getWatcherSummary,
  runAllWatchers,
  buildWatcherExecutive,
} from "./services/watcher-core.service";

export {
  enrichMemoriesWithWatchers,
  enrichIntelligenceWithWatchers,
} from "./services/watcher-bridge.service";

export { ExecutiveWatchersSection } from "./components/executive-watchers-section";

export type {
  MarketSeverity,
  MarketSignalType,
  MarketSignal,
  MarketRecommendation,
  MarketAlert,
  MarketOpportunity,
  MarketThreat,
  MarketTrend,
  CompetitiveMovement,
  MarketWatcherInput,
  MarketWatcherResult,
  MarketWatcherRunResult,
  MarketWatcherProviderData,
} from "./market";

export {
  MARKET_WATCHER_ID,
  fetchMarketWatcherMockData,
  runMarketWatcher,
  mergeMarketWatcherWithExecutive,
  buildCombinedWatcherExecutive,
  enrichMemoriesWithMarketWatcher,
  enrichIntelligenceWithMarketWatcher,
  MarketWatcherSection,
} from "./market";

export type {
  SeoSeverity,
  SeoSignalType,
  SeoSignal,
  SeoRecommendation,
  SeoAlert,
  SeoOpportunity,
  SeoRisk,
  SeoMetricsSnapshot,
  GrowingKeyword,
  SeoWatcherInput,
  SeoWatcherResult,
  SeoWatcherRunResult,
  SeoWatcherProviderData,
} from "./seo";

export {
  SEO_WATCHER_ID,
  fetchSeoWatcherData,
  runSeoWatcher,
  mergeSeoWatcherWithExecutive,
  enrichMemoriesWithSeoWatcher,
  enrichIntelligenceWithSeoWatcher,
  enrichMarketingWithSeoWatcher,
  SeoWatcherSection,
} from "./seo";

export {
  ExecutiveAlertCenter,
  ExecutiveAlertCard,
  ExecutiveAlertFilters,
  ExecutiveAlertSummary,
  buildExecutiveAlertCenter,
  filterExecutiveAlerts,
} from "./components/executive-alert-center";

export type {
  ExecutiveAlertSeverity,
  ExecutiveAlertStatus,
  ExecutiveAlertOrigin,
  ExecutiveAlertFilter,
  ConsolidatedExecutiveAlert,
  ExecutiveAlertCenterSummary,
  ExecutiveAlertCenterState,
  ExecutiveAlertCenterProps,
  BuildExecutiveAlertCenterInput,
} from "./components/executive-alert-center";
