export type WatcherCategory =
  | "market"
  | "seo"
  | "reputation"
  | "campaign"
  | "finance"
  | "sales"
  | "operations"
  | "legal"
  | "hr"
  | "technology";

export type WatcherSeverity = "critical" | "high" | "medium" | "low" | "info";

export type WatcherFrequency = "realtime" | "hourly" | "daily" | "weekly";

export type WatcherStatus =
  | "active"
  | "paused"
  | "triggered"
  | "resolved"
  | "dismissed";

export type WatcherSource =
  | "internal"
  | "external"
  | "integration"
  | "manual"
  | "scheduled";

export type WatcherSignal = {
  id: string;
  watcherId: string;
  category: WatcherCategory;
  metric: string;
  value: number;
  threshold: number;
  direction: "above" | "below";
  source: WatcherSource;
  detectedAt: string;
};

export type WatcherRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  responsibleArea: string;
};

export type WatcherAlert = {
  id: string;
  watcherId: string;
  title: string;
  description: string;
  severity: WatcherSeverity;
  source: WatcherSource;
  category: WatcherCategory;
  expectedImpact: string;
  recommendation: WatcherRecommendation;
  responsibleArea: string;
  confidence: number;
  status: WatcherStatus;
  createdAt: string;
  priority: number;
};

export type ExecutiveWatcher = {
  id: string;
  name: string;
  description: string;
  category: WatcherCategory;
  severity: WatcherSeverity;
  frequency: WatcherFrequency;
  status: WatcherStatus;
  source: WatcherSource;
  responsibleArea: string;
  lastRunAt?: string;
  nextRunAt?: string;
  signals: WatcherSignal[];
};

export type WatcherScheduleConfig = {
  frequency: WatcherFrequency;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
};

export type WatcherSummary = {
  totalWatchers: number;
  activeWatchers: number;
  triggeredWatchers: number;
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  averageConfidence: number;
  lastEvaluationAt: string;
  summary: string;
};

export type WatcherExecutive = {
  watchers: ExecutiveWatcher[];
  activeWatchers: ExecutiveWatcher[];
  recentAlerts: WatcherAlert[];
  summary: WatcherSummary;
  watcherExecutiveSummary: string;
};

export type RunWatcherResult = {
  watcher: ExecutiveWatcher;
  alerts: WatcherAlert[];
  evaluatedAt: string;
};

export type WatcherCoreInput = {
  companyId?: string;
  companyName?: string;
  /** When omitted, starts empty — never injects the legacy mock watchers. */
  watchers?: ExecutiveWatcher[];
};
