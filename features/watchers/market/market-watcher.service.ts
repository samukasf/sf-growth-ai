import {
  buildWatcherExecutive,
  createWatcherAlert,
  runWatcher,
} from "../services/watcher-core.service";
import { sortAlertsByPriority } from "../utils/watcher-priority";
import type {
  ExecutiveWatcher,
  WatcherAlert,
  WatcherCoreInput,
  WatcherExecutive,
  WatcherSeverity,
  WatcherSignal,
} from "../types/watcher.types";
import { fetchMarketWatcherMockData } from "./market-watcher.provider";
import type {
  MarketAlert,
  MarketSeverity,
  MarketSignal,
  MarketWatcherInput,
  MarketWatcherResult,
} from "./market-watcher.types";

export const MARKET_WATCHER_ID = "watcher-market-intelligence";

export type MarketWatcherRunResult = MarketWatcherResult & {
  coreAlerts: WatcherAlert[];
};

function toWatcherSeverity(severity: MarketSeverity): WatcherSeverity {
  const map: Record<MarketSeverity, WatcherSeverity> = {
    Critical: "critical",
    High: "high",
    Medium: "medium",
    Low: "low",
  };
  return map[severity];
}

function toRecommendationPriority(
  severity: MarketSeverity,
): "critical" | "high" | "medium" | "low" {
  const severityValue = toWatcherSeverity(severity);
  if (severityValue === "info") return "low";
  return severityValue;
}

function toWatcherSignal(signal: MarketSignal): WatcherSignal | null {
  if (!signal.metric || signal.value === undefined || signal.threshold === undefined) {
    return null;
  }

  return {
    id: signal.id,
    watcherId: MARKET_WATCHER_ID,
    category: "market",
    metric: signal.metric,
    value: signal.value,
    threshold: signal.threshold,
    direction: signal.value >= signal.threshold ? "above" : "below",
    source: "integration",
    detectedAt: signal.detectedAt,
  };
}

function buildMarketExecutiveWatcher(signals: MarketSignal[]): ExecutiveWatcher {
  return {
    id: MARKET_WATCHER_ID,
    name: "Market Watcher",
    description:
      "Monitoramento contínuo de mercado, concorrentes, tendências e ameaças competitivas.",
    category: "market",
    severity: "high",
    frequency: "hourly",
    status: "active",
    source: "integration",
    responsibleArea: "Strategy",
    signals: signals
      .map(toWatcherSignal)
      .filter((signal): signal is WatcherSignal => signal !== null),
  };
}

function marketAlertToCoreAlert(
  watcher: ExecutiveWatcher,
  marketAlert: MarketAlert,
): WatcherAlert {
  const dummySignal: WatcherSignal = {
    id: marketAlert.id,
    watcherId: MARKET_WATCHER_ID,
    category: "market",
    metric: "market_alert",
    value: 100,
    threshold: 50,
    direction: "above",
    source: "integration",
    detectedAt: marketAlert.createdAt,
  };

  return createWatcherAlert(watcher, dummySignal, {
    id: `market-${marketAlert.id}`,
    title: marketAlert.title,
    description: marketAlert.description,
    severity: toWatcherSeverity(marketAlert.severity),
    source: "integration",
    expectedImpact: marketAlert.expectedImpact,
    confidence: marketAlert.confidence,
    status: "triggered",
    createdAt: marketAlert.createdAt,
    recommendation: {
      id: marketAlert.recommendation.id,
      title: marketAlert.recommendation.title,
      description: marketAlert.recommendation.description,
      priority: toRecommendationPriority(marketAlert.recommendation.priority),
      responsibleArea: marketAlert.recommendation.responsibleArea,
    },
    responsibleArea: marketAlert.responsibleArea,
  });
}

export function runMarketWatcher(
  input: MarketWatcherInput = {},
): MarketWatcherRunResult {
  const providerData = fetchMarketWatcherMockData(input);
  const watcher = buildMarketExecutiveWatcher(providerData.signals);
  const { alerts: metricAlerts } = runWatcher(watcher);
  const providerAlerts = providerData.alerts.map((alert) =>
    marketAlertToCoreAlert(watcher, alert),
  );
  const coreAlerts = sortAlertsByPriority([...metricAlerts, ...providerAlerts]);

  const allConfidences = [
    ...providerData.signals.map((signal) => signal.confidence),
    ...providerData.alerts.map((alert) => alert.confidence),
  ];
  const averageConfidence =
    allConfidences.length > 0
      ? Math.round(allConfidences.reduce((sum, value) => sum + value, 0) / allConfidences.length)
      : 0;

  const company = input.companyName ?? "Empresa";
  const executiveSummary = `${company} — Market Watcher detectou ${providerData.trends.length} tendência(s), ${providerData.newCompetitors.length} novo(s) concorrente(s), ${providerData.opportunities.length} oportunidade(s) e ${providerData.threats.length} ameaça(s). Confiança média ${averageConfidence}%.`;

  return {
    signals: providerData.signals,
    alerts: providerData.alerts,
    opportunities: providerData.opportunities,
    threats: providerData.threats,
    trends: providerData.trends,
    competitiveMovements: providerData.competitiveMovements,
    newCompetitors: providerData.newCompetitors,
    recommendations: providerData.recommendations,
    averageConfidence,
    executiveSummary,
    evaluatedAt: new Date().toISOString(),
    coreAlerts,
  };
}

export function mergeMarketWatcherWithExecutive(
  core: WatcherExecutive,
  market: MarketWatcherRunResult,
): WatcherExecutive {
  const marketWatcher = buildMarketExecutiveWatcher(market.signals);
  const mergedAlerts = sortAlertsByPriority([
    ...core.recentAlerts,
    ...market.coreAlerts,
  ]).slice(0, 15);

  const criticalAlerts = mergedAlerts.filter((alert) => alert.severity === "critical").length;
  const highAlerts = mergedAlerts.filter((alert) => alert.severity === "high").length;
  const averageConfidence =
    mergedAlerts.length > 0
      ? Math.round(
          mergedAlerts.reduce((sum, alert) => sum + alert.confidence, 0) / mergedAlerts.length,
        )
      : core.summary.averageConfidence;

  const hasMarketWatcher = core.watchers.some((watcher) => watcher.id === MARKET_WATCHER_ID);

  return {
    ...core,
    watchers: hasMarketWatcher ? core.watchers : [...core.watchers, marketWatcher],
    activeWatchers: hasMarketWatcher
      ? core.activeWatchers
      : [...core.activeWatchers, marketWatcher],
    recentAlerts: mergedAlerts,
    summary: {
      ...core.summary,
      totalAlerts: mergedAlerts.length,
      criticalAlerts,
      highAlerts,
      averageConfidence,
      lastEvaluationAt: market.evaluatedAt,
      summary: `${core.summary.summary} ${market.executiveSummary}`,
    },
    watcherExecutiveSummary: `${core.watcherExecutiveSummary} ${market.executiveSummary}`,
  };
}

export function buildCombinedWatcherExecutive(
  input: WatcherCoreInput & MarketWatcherInput = {},
): {
  watcherExecutive: WatcherExecutive;
  marketWatcher: MarketWatcherRunResult;
} {
  const core = buildWatcherExecutive(input);
  const marketWatcher = runMarketWatcher(input);
  const watcherExecutive = mergeMarketWatcherWithExecutive(core, marketWatcher);

  return { watcherExecutive, marketWatcher };
}
