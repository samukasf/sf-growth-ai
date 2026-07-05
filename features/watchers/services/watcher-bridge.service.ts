import type { CompanyMemoryRecord } from "@/services/executive-memory.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";

import type { WatcherExecutive } from "../types/watcher.types";

export function enrichMemoriesWithWatchers(
  memories: CompanyMemoryRecord[],
  watchers: WatcherExecutive | null | undefined,
): CompanyMemoryRecord[] {
  if (!watchers || watchers.recentAlerts.length === 0) return memories;

  const watcherMemories: CompanyMemoryRecord[] = watchers.recentAlerts
    .slice(0, 5)
    .map((alert) => ({
      id: `watcher-memory-${alert.id}`,
      company_id: "watcher",
      category: "watcher",
      title: `[Watcher] ${alert.title}`,
      content: `${alert.description} Impacto: ${alert.expectedImpact} Recomendação: ${alert.recommendation.description}`,
      importance: alert.severity === "critical" ? 9 : alert.severity === "high" ? 8 : 6,
      source: `watcher:${alert.source}`,
    }));

  return [...watcherMemories, ...memories];
}

export function enrichIntelligenceWithWatchers(
  intelligence: ExecutiveIntelligence | null | undefined,
  watchers: WatcherExecutive | null | undefined,
): ExecutiveIntelligence | null {
  if (!intelligence || !watchers) return intelligence ?? null;

  const watcherRisks = watchers.recentAlerts
    .filter((alert) => alert.severity === "critical" || alert.severity === "high")
    .slice(0, 3)
    .map((alert) => `[Watcher] ${alert.title}: ${alert.description}`);

  const watcherOpportunities = watchers.recentAlerts
    .filter((alert) => alert.severity === "medium" || alert.severity === "low")
    .slice(0, 2)
    .map((alert) => `Monitorar ${alert.category}: ${alert.recommendation.title}`);

  const watcherPriorities = watchers.recentAlerts
    .slice(0, 3)
    .map((alert) => alert.recommendation.title);

  return {
    ...intelligence,
    risks: [...watcherRisks, ...intelligence.risks].slice(0, 8),
    opportunities: [...watcherOpportunities, ...intelligence.opportunities].slice(0, 8),
    priorities: [...watcherPriorities, ...intelligence.priorities].slice(0, 8),
    executiveSummary: `${intelligence.executiveSummary} Watchers: ${watchers.summary.activeWatchers} ativo(s) · ${watchers.summary.totalAlerts} alerta(s) · confiança média ${watchers.summary.averageConfidence}%.`,
  };
}
