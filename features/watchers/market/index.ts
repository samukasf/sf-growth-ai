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
} from "./market-watcher.types";

export { fetchMarketWatcherMockData } from "./market-watcher.provider";
export type { MarketWatcherProviderData } from "./market-watcher.provider";

export {
  MARKET_WATCHER_ID,
  runMarketWatcher,
  mergeMarketWatcherWithExecutive,
  buildCombinedWatcherExecutive,
} from "./market-watcher.service";
export type { MarketWatcherRunResult } from "./market-watcher.service";

export {
  enrichMemoriesWithMarketWatcher,
  enrichIntelligenceWithMarketWatcher,
} from "./market-watcher.bridge";

export { MarketWatcherSection } from "./components/market-watcher-section";
