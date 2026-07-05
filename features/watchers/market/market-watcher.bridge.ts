import type { CompanyMemoryRecord } from "@/services/executive-memory.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";

import type { MarketWatcherRunResult } from "./market-watcher.service";

export function enrichMemoriesWithMarketWatcher(
  memories: CompanyMemoryRecord[],
  market: MarketWatcherRunResult | null | undefined,
): CompanyMemoryRecord[] {
  if (!market || market.alerts.length === 0) return memories;

  const marketMemories: CompanyMemoryRecord[] = market.alerts
    .slice(0, 5)
    .map((alert) => ({
      id: `market-memory-${alert.id}`,
      company_id: "market-watcher",
      category: "market",
      title: `[Market] ${alert.title}`,
      content: `${alert.description} Impacto: ${alert.expectedImpact} Recomendação: ${alert.recommendation.description}`,
      importance:
        alert.severity === "Critical" ? 9 : alert.severity === "High" ? 8 : 6,
      source: `market-watcher:${alert.source}`,
    }));

  return [...marketMemories, ...memories];
}

export function enrichIntelligenceWithMarketWatcher(
  intelligence: ExecutiveIntelligence | null | undefined,
  market: MarketWatcherRunResult | null | undefined,
): ExecutiveIntelligence | null {
  if (!intelligence || !market) return intelligence ?? null;

  const marketRisks = market.threats
    .filter((threat) => threat.severity === "Critical" || threat.severity === "High")
    .slice(0, 3)
    .map((threat) => `[Market] ${threat.title}: ${threat.description}`);

  const marketOpportunities = market.opportunities
    .slice(0, 3)
    .map(
      (opportunity) =>
        `[Market] ${opportunity.title}: ${opportunity.growthPotential}`,
    );

  const marketPriorities = market.recommendations
    .filter((rec) => rec.priority === "Critical" || rec.priority === "High")
    .slice(0, 3)
    .map((rec) => rec.title);

  return {
    ...intelligence,
    risks: [...marketRisks, ...intelligence.risks].slice(0, 8),
    opportunities: [...marketOpportunities, ...intelligence.opportunities].slice(0, 8),
    priorities: [...marketPriorities, ...intelligence.priorities].slice(0, 8),
    executiveSummary: `${intelligence.executiveSummary} Market Watcher: ${market.trends.length} tendência(s) · ${market.newCompetitors.length} concorrente(s) · confiança ${market.averageConfidence}%.`,
  };
}
