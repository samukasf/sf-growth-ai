import {
  createWatcherAlert,
  runWatcher,
} from "../services/watcher-core.service";
import { sortAlertsByPriority } from "../utils/watcher-priority";
import type {
  ExecutiveWatcher,
  WatcherAlert,
  WatcherExecutive,
  WatcherSeverity,
  WatcherSignal,
} from "../types/watcher.types";
import { fetchSeoWatcherData } from "./seo-watcher.provider";
import type {
  SeoAlert,
  SeoSeverity,
  SeoSignal,
  SeoWatcherInput,
  SeoWatcherResult,
} from "./seo-watcher.types";

export const SEO_WATCHER_ID = "watcher-seo-intelligence";

export type SeoWatcherRunResult = SeoWatcherResult & {
  coreAlerts: WatcherAlert[];
};

function toWatcherSeverity(severity: SeoSeverity): WatcherSeverity {
  const map: Record<SeoSeverity, WatcherSeverity> = {
    Critical: "critical",
    High: "high",
    Medium: "medium",
    Low: "low",
  };
  return map[severity];
}

function toRecommendationPriority(
  severity: SeoSeverity,
): "critical" | "high" | "medium" | "low" {
  const severityValue = toWatcherSeverity(severity);
  if (severityValue === "info") return "low";
  return severityValue;
}

function toWatcherSignal(signal: SeoSignal): WatcherSignal | null {
  if (!signal.metric || signal.value === undefined || signal.threshold === undefined) {
    return null;
  }

  return {
    id: signal.id,
    watcherId: SEO_WATCHER_ID,
    category: "seo",
    metric: signal.metric,
    value: signal.value,
    threshold: signal.threshold,
    direction: signal.type.includes("drop") || signal.type === "position_loss"
      ? signal.value < signal.threshold
        ? "below"
        : "above"
      : signal.value >= signal.threshold
        ? "above"
        : "below",
    source: "integration",
    detectedAt: signal.detectedAt,
  };
}

function buildSeoExecutiveWatcher(signals: SeoSignal[]): ExecutiveWatcher {
  return {
    id: SEO_WATCHER_ID,
    name: "SEO Watcher",
    description:
      "Monitoramento contínuo de presença orgânica no Google via Search Console.",
    category: "seo",
    severity: "high",
    frequency: "daily",
    status: "active",
    source: "integration",
    responsibleArea: "SEO",
    signals: signals
      .map(toWatcherSignal)
      .filter((signal): signal is WatcherSignal => signal !== null),
  };
}

function seoAlertToCoreAlert(watcher: ExecutiveWatcher, seoAlert: SeoAlert): WatcherAlert {
  const dummySignal: WatcherSignal = {
    id: seoAlert.id,
    watcherId: SEO_WATCHER_ID,
    category: "seo",
    metric: "seo_alert",
    value: 100,
    threshold: 50,
    direction: "above",
    source: "integration",
    detectedAt: seoAlert.createdAt,
  };

  return createWatcherAlert(watcher, dummySignal, {
    id: `seo-${seoAlert.id}`,
    title: seoAlert.title,
    description: seoAlert.description,
    severity: toWatcherSeverity(seoAlert.severity),
    source: "integration",
    expectedImpact: seoAlert.expectedImpact,
    confidence: seoAlert.confidence,
    status: "triggered",
    createdAt: seoAlert.createdAt,
    recommendation: {
      id: seoAlert.recommendation.id,
      title: seoAlert.recommendation.title,
      description: seoAlert.recommendation.description,
      priority: toRecommendationPriority(seoAlert.recommendation.priority),
      responsibleArea: seoAlert.recommendation.responsibleArea,
    },
    responsibleArea: seoAlert.responsibleArea,
  });
}

export function runSeoWatcher(input: SeoWatcherInput = {}): SeoWatcherRunResult {
  const providerData = fetchSeoWatcherData(input);
  const watcher = buildSeoExecutiveWatcher(providerData.signals);
  const { alerts: metricAlerts } = runWatcher(watcher);
  const providerAlerts = providerData.alerts.map((alert) =>
    seoAlertToCoreAlert(watcher, alert),
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
  const sourceLabel =
    providerData.dataSource === "google-search-console"
      ? "Google Search Console"
      : "Provider Mock";
  const executiveSummary = `${company} — SEO Watcher (${sourceLabel}): ${providerData.metrics.clicks.toLocaleString("pt-BR")} cliques · ${providerData.metrics.impressions.toLocaleString("pt-BR")} impressões · CTR ${providerData.metrics.ctr}% · posição ${providerData.metrics.averagePosition}. ${providerData.alerts.length} alerta(s) · ${providerData.opportunities.length} oportunidade(s). Confiança ${averageConfidence}%.`;

  return {
    signals: providerData.signals,
    alerts: providerData.alerts,
    opportunities: providerData.opportunities,
    risks: providerData.risks,
    recommendations: providerData.recommendations,
    metrics: providerData.metrics,
    growingKeywords: providerData.growingKeywords,
    pagesAtRisk: providerData.pagesAtRisk,
    averageConfidence,
    executiveSummary,
    dataSource: providerData.dataSource,
    evaluatedAt: new Date().toISOString(),
    coreAlerts,
  };
}

export function mergeSeoWatcherWithExecutive(
  core: WatcherExecutive,
  seo: SeoWatcherRunResult,
): WatcherExecutive {
  const seoWatcher = buildSeoExecutiveWatcher(seo.signals);
  const mergedAlerts = sortAlertsByPriority([
    ...core.recentAlerts,
    ...seo.coreAlerts,
  ]).slice(0, 18);

  const criticalAlerts = mergedAlerts.filter((alert) => alert.severity === "critical").length;
  const highAlerts = mergedAlerts.filter((alert) => alert.severity === "high").length;
  const averageConfidence =
    mergedAlerts.length > 0
      ? Math.round(
          mergedAlerts.reduce((sum, alert) => sum + alert.confidence, 0) / mergedAlerts.length,
        )
      : core.summary.averageConfidence;

  const hasSeoWatcher = core.watchers.some((watcher) => watcher.id === SEO_WATCHER_ID);

  return {
    ...core,
    watchers: hasSeoWatcher ? core.watchers : [...core.watchers, seoWatcher],
    activeWatchers: hasSeoWatcher ? core.activeWatchers : [...core.activeWatchers, seoWatcher],
    recentAlerts: mergedAlerts,
    summary: {
      ...core.summary,
      totalAlerts: mergedAlerts.length,
      criticalAlerts,
      highAlerts,
      averageConfidence,
      lastEvaluationAt: seo.evaluatedAt,
      summary: `${core.summary.summary} ${seo.executiveSummary}`,
    },
    watcherExecutiveSummary: `${core.watcherExecutiveSummary} ${seo.executiveSummary}`,
  };
}
