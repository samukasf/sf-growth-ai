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
