import { MOCK_EXECUTIVE_WATCHERS } from "../constants/watcher.constants";
import type {
  ExecutiveWatcher,
  RunWatcherResult,
  WatcherAlert,
  WatcherCoreInput,
  WatcherExecutive,
  WatcherRecommendation,
  WatcherSeverity,
  WatcherSignal,
  WatcherSummary,
} from "../types/watcher.types";
import {
  calculateSignalDeviation,
  calculateWatcherPriority,
  deriveSeverityFromSignal,
  sortAlertsByPriority,
} from "../utils/watcher-priority";

function isSignalTriggered(signal: WatcherSignal): boolean {
  if (signal.direction === "above") return signal.value > signal.threshold;
  return signal.value < signal.threshold;
}

function buildRecommendation(
  watcher: ExecutiveWatcher,
  signal: WatcherSignal,
  severity: WatcherSeverity,
): WatcherRecommendation {
  const priority =
    severity === "critical" || severity === "high"
      ? severity
      : severity === "medium"
        ? "medium"
        : "low";

  return {
    id: `rec-${watcher.id}-${signal.id}`,
    title: `Ação recomendada — ${watcher.name}`,
    description: `Revisar ${signal.metric} na área ${watcher.responsibleArea} e acionar plano corretivo.`,
    priority,
    responsibleArea: watcher.responsibleArea,
  };
}

function buildExpectedImpact(severity: WatcherSeverity, category: ExecutiveWatcher["category"]): string {
  const impacts: Record<WatcherSeverity, string> = {
    critical: "Impacto alto em receita, reputação ou continuidade operacional.",
    high: "Impacto significativo em performance e decisões executivas.",
    medium: "Impacto moderado que exige acompanhamento nas próximas 48h.",
    low: "Impacto limitado, mas relevante para otimização contínua.",
    info: "Sinal informativo para monitoramento preventivo.",
  };

  return `${impacts[severity]} Área: ${category}.`;
}

function buildConfidence(signal: WatcherSignal, severity: WatcherSeverity): number {
  const deviation = Math.abs(calculateSignalDeviation(signal));
  let confidence = 55 + Math.min(30, deviation);

  if (severity === "critical" || severity === "high") confidence += 8;
  if (signal.source === "integration") confidence += 5;

  return Math.max(40, Math.min(98, Math.round(confidence)));
}

export function createWatcherAlert(
  watcher: ExecutiveWatcher,
  signal: WatcherSignal,
  overrides?: Partial<WatcherAlert>,
): WatcherAlert {
  const severity = overrides?.severity ?? deriveSeverityFromSignal(signal);
  const confidence = overrides?.confidence ?? buildConfidence(signal, severity);
  const deviation = calculateSignalDeviation(signal);
  const priority = calculateWatcherPriority(severity, confidence, deviation);
  const recommendation =
    overrides?.recommendation ?? buildRecommendation(watcher, signal, severity);

  return {
    id: overrides?.id ?? `alert-${watcher.id}-${signal.id}`,
    watcherId: watcher.id,
    title:
      overrides?.title ??
      `${watcher.name}: ${signal.metric} ${signal.direction === "above" ? "acima" : "abaixo"} do limite`,
    description:
      overrides?.description ??
      `Valor ${signal.value} vs limite ${signal.threshold} (${deviation > 0 ? "+" : ""}${deviation}%). ${watcher.description}`,
    severity,
    source: overrides?.source ?? signal.source,
    category: watcher.category,
    expectedImpact:
      overrides?.expectedImpact ?? buildExpectedImpact(severity, watcher.category),
    recommendation,
    responsibleArea: watcher.responsibleArea,
    confidence,
    status: overrides?.status ?? "triggered",
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    priority,
  };
}

export function evaluateSignal(
  watcher: ExecutiveWatcher,
  signal: WatcherSignal,
): WatcherAlert | null {
  if (!isSignalTriggered(signal)) return null;
  return createWatcherAlert(watcher, signal);
}

export function runWatcher(watcher: ExecutiveWatcher): RunWatcherResult {
  const alerts = watcher.signals
    .map((signal) => evaluateSignal(watcher, signal))
    .filter((alert): alert is WatcherAlert => alert !== null);

  const evaluatedWatcher: ExecutiveWatcher = {
    ...watcher,
    status: alerts.length > 0 ? "triggered" : watcher.status,
    lastRunAt: new Date().toISOString(),
  };

  return {
    watcher: evaluatedWatcher,
    alerts,
    evaluatedAt: new Date().toISOString(),
  };
}

export function getActiveWatchers(
  watchers: ExecutiveWatcher[] = MOCK_EXECUTIVE_WATCHERS,
): ExecutiveWatcher[] {
  return watchers.filter((watcher) => watcher.status === "active" || watcher.status === "triggered");
}

export function getWatcherSummary(
  watchers: ExecutiveWatcher[],
  alerts: WatcherAlert[],
  companyName = "Empresa",
): WatcherSummary {
  const activeWatchers = getActiveWatchers(watchers);
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical").length;
  const highAlerts = alerts.filter((alert) => alert.severity === "high").length;
  const averageConfidence =
    alerts.length > 0
      ? Math.round(alerts.reduce((sum, alert) => sum + alert.confidence, 0) / alerts.length)
      : 0;

  return {
    totalWatchers: watchers.length,
    activeWatchers: activeWatchers.length,
    triggeredWatchers: watchers.filter((watcher) => watcher.status === "triggered").length,
    totalAlerts: alerts.length,
    criticalAlerts,
    highAlerts,
    averageConfidence,
    lastEvaluationAt: new Date().toISOString(),
    summary: `${companyName} — ${activeWatchers.length} watcher(s) ativo(s), ${alerts.length} alerta(s) recente(s), ${criticalAlerts} crítico(s). Monitoramento executivo contínuo via Samuel AI™.`,
  };
}

export function runAllWatchers(
  watchers: ExecutiveWatcher[] = MOCK_EXECUTIVE_WATCHERS,
): { watchers: ExecutiveWatcher[]; alerts: WatcherAlert[] } {
  const results = watchers.map((watcher) => runWatcher(watcher));
  const alerts = sortAlertsByPriority(results.flatMap((result) => result.alerts));

  return {
    watchers: results.map((result) => result.watcher),
    alerts,
  };
}

export function buildWatcherExecutive(input: WatcherCoreInput = {}): WatcherExecutive {
  const companyName = input.companyName ?? "Empresa";
  const sourceWatchers = input.watchers ?? [];
  const { watchers, alerts } = runAllWatchers(sourceWatchers);
  const activeWatchers = getActiveWatchers(watchers);
  const recentAlerts = sortAlertsByPriority(alerts).slice(0, 12);
  const summary = getWatcherSummary(watchers, recentAlerts, companyName);

  return {
    watchers,
    activeWatchers,
    recentAlerts,
    summary,
    watcherExecutiveSummary: summary.summary,
  };
}
