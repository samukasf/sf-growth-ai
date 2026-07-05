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
} from "./seo-watcher.types";

export { fetchSeoWatcherData } from "./seo-watcher.provider";
export type { SeoWatcherProviderData } from "./seo-watcher.provider";

export {
  SEO_WATCHER_ID,
  runSeoWatcher,
  mergeSeoWatcherWithExecutive,
} from "./seo-watcher.service";
export type { SeoWatcherRunResult } from "./seo-watcher.service";

export {
  enrichMemoriesWithSeoWatcher,
  enrichIntelligenceWithSeoWatcher,
  enrichMarketingWithSeoWatcher,
} from "./seo-watcher.bridge";

export { SeoWatcherSection } from "./components/seo-watcher-section";
