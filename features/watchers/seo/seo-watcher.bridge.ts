import type { CompanyMemoryRecord } from "@/services/executive-memory.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";

import type { SeoWatcherRunResult } from "./seo-watcher.service";

export function enrichMemoriesWithSeoWatcher(
  memories: CompanyMemoryRecord[],
  seo: SeoWatcherRunResult | null | undefined,
): CompanyMemoryRecord[] {
  if (!seo || seo.alerts.length === 0) return memories;

  const seoMemories: CompanyMemoryRecord[] = seo.alerts.slice(0, 5).map((alert) => ({
    id: `seo-memory-${alert.id}`,
    company_id: "seo-watcher",
    category: "seo",
    title: `[SEO] ${alert.title}`,
    content: `${alert.description} Impacto: ${alert.expectedImpact} Recomendação: ${alert.recommendation.description}`,
    importance:
      alert.severity === "Critical" ? 9 : alert.severity === "High" ? 8 : 6,
    source: `seo-watcher:${alert.source}`,
  }));

  return [...seoMemories, ...memories];
}

export function enrichIntelligenceWithSeoWatcher(
  intelligence: ExecutiveIntelligence | null | undefined,
  seo: SeoWatcherRunResult | null | undefined,
): ExecutiveIntelligence | null {
  if (!intelligence || !seo) return intelligence ?? null;

  const seoRisks = seo.risks
    .filter((risk) => risk.severity === "Critical" || risk.severity === "High")
    .slice(0, 3)
    .map((risk) => `[SEO] ${risk.title}: ${risk.description}`);

  const seoOpportunities = seo.opportunities
    .slice(0, 3)
    .map((opportunity) => `[SEO] ${opportunity.title}: ${opportunity.growthPotential}`);

  const seoPriorities = seo.recommendations
    .filter((rec) => rec.priority === "Critical" || rec.priority === "High")
    .slice(0, 3)
    .map((rec) => rec.title);

  return {
    ...intelligence,
    risks: [...seoRisks, ...intelligence.risks].slice(0, 8),
    opportunities: [...seoOpportunities, ...intelligence.opportunities].slice(0, 8),
    priorities: [...seoPriorities, ...intelligence.priorities].slice(0, 8),
    executiveSummary: `${intelligence.executiveSummary} SEO Watcher: ${seo.metrics.clicks.toLocaleString("pt-BR")} cliques · CTR ${seo.metrics.ctr}% · confiança ${seo.averageConfidence}%.`,
  };
}

export function enrichMarketingWithSeoWatcher(
  marketing: MarketingExecutive | null | undefined,
  seo: SeoWatcherRunResult | null | undefined,
): MarketingExecutive | null {
  if (!marketing || !seo) return marketing ?? null;

  const seoBoost = Math.min(10, Math.round(seo.metrics.seoHealthScore * 0.1));

  return {
    ...marketing,
    marketingHealthScore: Math.min(100, marketing.marketingHealthScore + Math.round(seoBoost * 0.3)),
    marketingExecutiveSummary: `${marketing.marketingExecutiveSummary} SEO Watcher: ${seo.alerts.length} alerta(s) · ${seo.opportunities.length} oportunidade(s) orgânica(s).`,
  };
}
