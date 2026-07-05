import type { WatcherAlert, WatcherSeverity, WatcherSignal } from "../types/watcher.types";

const SEVERITY_WEIGHT: Record<WatcherSeverity, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
  info: 10,
};

export function calculateWatcherPriority(
  severity: WatcherSeverity,
  confidence: number,
  signalDeviation?: number,
): number {
  const base = SEVERITY_WEIGHT[severity];
  const confidenceBoost = Math.min(20, confidence * 0.2);
  const deviationBoost = signalDeviation
    ? Math.min(15, Math.abs(signalDeviation) * 0.5)
    : 0;

  return Math.max(0, Math.min(100, Math.round(base + confidenceBoost + deviationBoost)));
}

export function calculateSignalDeviation(signal: WatcherSignal): number {
  if (signal.threshold === 0) return 0;
  return Math.round(((signal.value - signal.threshold) / Math.abs(signal.threshold)) * 100);
}

export function sortAlertsByPriority(alerts: WatcherAlert[]): WatcherAlert[] {
  return [...alerts].sort((a, b) => b.priority - a.priority);
}

export function deriveSeverityFromSignal(signal: WatcherSignal): WatcherSeverity {
  const deviation = Math.abs(calculateSignalDeviation(signal));

  if (deviation >= 40) return "critical";
  if (deviation >= 25) return "high";
  if (deviation >= 12) return "medium";
  if (deviation >= 5) return "low";
  return "info";
}
