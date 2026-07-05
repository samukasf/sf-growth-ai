import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type SearchConsoleQueryMetric = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsolePageMetric = {
  path: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchConsoleKeywordOpportunity = {
  query: string;
  impressions: number;
  position: number;
  potentialClicks: number;
};

export type SearchConsoleIndexingIssue = {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedUrls: number;
  description: string;
};

export type SearchConsoleCoreWebVital = {
  id: string;
  label: string;
  status: "good" | "needs_improvement" | "poor";
  value: string;
  score: number;
};

export type SearchConsoleInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type SearchConsoleRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type SearchConsoleMetrics = {
  seoHealthScore: number;
  organicTrafficScore: number;
  coreWebVitalsScore: number;
  ctrScore: number;
  impressions: number;
  clicks: number;
  averagePosition: number;
  ctr: number;
  trafficTrend: "up" | "down" | "stable";
  trafficTrendPercent: number;
  topQueries: SearchConsoleQueryMetric[];
  topPages: SearchConsolePageMetric[];
  keywordOpportunities: SearchConsoleKeywordOpportunity[];
  indexingIssues: SearchConsoleIndexingIssue[];
  indexedPages: number;
  indexErrors: number;
  indexWarnings: number;
  coreWebVitals: SearchConsoleCoreWebVital[];
  countries: Array<{ code: string; clicks: number; impressions: number }>;
  devices: Array<{ device: string; clicks: number; impressions: number }>;
  sitemapsSubmitted: number;
  searchAppearances: Array<{
    appearance: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }>;
};

export type SearchConsoleExecutive = {
  seoHealthScore: number;
  organicTrafficScore: number;
  coreWebVitalsScore: number;
  ctrScore: number;
  impressions: number;
  clicks: number;
  averagePosition: number;
  ctr: number;
  keywordOpportunities: SearchConsoleKeywordOpportunity[];
  topQueries: SearchConsoleQueryMetric[];
  topPages: SearchConsolePageMetric[];
  indexingIssues: SearchConsoleIndexingIssue[];
  coreWebVitals: SearchConsoleCoreWebVital[];
  searchConsoleRisks: SearchConsoleInsightItem[];
  searchConsoleRecommendations: SearchConsoleRecommendation[];
  searchConsoleExecutiveSummary: string;
};

export type SearchConsoleExecutiveInput = {
  metrics?: SearchConsoleMetrics;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

const MOCK_METRICS: SearchConsoleMetrics = {
  seoHealthScore: 0,
  organicTrafficScore: 0,
  coreWebVitalsScore: 78,
  ctrScore: 0,
  impressions: 128400,
  clicks: 4820,
  averagePosition: 14.2,
  ctr: 3.76,
  trafficTrend: "up",
  trafficTrendPercent: 9,
  topQueries: [
    { query: "growth marketing b2b", clicks: 420, impressions: 8420, ctr: 4.99, position: 8.2 },
    { query: "inteligência artificial empresas", clicks: 312, impressions: 6240, ctr: 5.0, position: 11.4 },
    { query: "automação vendas", clicks: 248, impressions: 5180, ctr: 4.79, position: 12.1 },
    { query: "crm executivo", clicks: 186, impressions: 3920, ctr: 4.74, position: 15.6 },
    { query: "seo local", clicks: 142, impressions: 2840, ctr: 5.0, position: 18.3 },
  ],
  topPages: [
    { path: "/", clicks: 1240, impressions: 28400, ctr: 4.37, position: 12.4 },
    { path: "/blog/growth-ai", clicks: 820, impressions: 18200, ctr: 4.51, position: 10.8 },
    { path: "/pricing", clicks: 640, impressions: 14800, ctr: 4.32, position: 14.1 },
    { path: "/samuel-ai", clicks: 520, impressions: 9200, ctr: 5.65, position: 9.6 },
    { path: "/contact", clicks: 380, impressions: 6400, ctr: 5.94, position: 16.2 },
  ],
  keywordOpportunities: [
    { query: "crm executivo", impressions: 3920, position: 15.6, potentialClicks: 196 },
    { query: "seo local", impressions: 2840, position: 18.3, potentialClicks: 142 },
    { query: "automação vendas", impressions: 5180, position: 12.1, potentialClicks: 259 },
  ],
  indexingIssues: [
    {
      id: "idx-1",
      type: "Crawled - currently not indexed",
      severity: "high",
      affectedUrls: 12,
      description: "12 URLs rastreadas sem indexação — revisar qualidade e canonical.",
    },
    {
      id: "idx-2",
      type: "Duplicate without user-selected canonical",
      severity: "medium",
      affectedUrls: 6,
      description: "6 URLs com canonical duplicado — consolidar versões.",
    },
  ],
  indexedPages: 142,
  indexErrors: 4,
  indexWarnings: 7,
  coreWebVitals: [
    { id: "lcp", label: "LCP", status: "good", value: "2.1s", score: 85 },
    { id: "inp", label: "INP", status: "needs_improvement", value: "220ms", score: 72 },
    { id: "cls", label: "CLS", status: "good", value: "0.08", score: 88 },
  ],
  countries: [
    { code: "bra", clicks: 3120, impressions: 84200 },
    { code: "prt", clicks: 840, impressions: 18200 },
  ],
  devices: [
    { device: "MOBILE", clicks: 2640, impressions: 72400 },
    { device: "DESKTOP", clicks: 1980, impressions: 48200 },
  ],
  sitemapsSubmitted: 2,
  searchAppearances: [
    { appearance: "WEB", clicks: 3820, impressions: 102400, ctr: 3.73 },
    { appearance: "RICH_RESULT", clicks: 640, impressions: 18400, ctr: 3.48 },
  ],
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveMetrics(input: SearchConsoleExecutiveInput): SearchConsoleMetrics {
  const base = input.metrics ?? MOCK_METRICS;
  const organicTrafficScore = calculateOrganicTrafficScore(base);
  const ctrScore = calculateCtrScore(base);
  const seoHealthScore = calculateSeoHealthScore(base, organicTrafficScore, ctrScore);

  return {
    ...base,
    organicTrafficScore,
    ctrScore,
    seoHealthScore,
  };
}

function calculateOrganicTrafficScore(metrics: SearchConsoleMetrics): number {
  let score = 35;
  score += Math.min(25, (metrics.clicks / 8000) * 100 * 0.25);
  score += Math.min(20, (metrics.impressions / 150000) * 100 * 0.2);
  if (metrics.trafficTrend === "up") score += Math.min(12, metrics.trafficTrendPercent * 0.6);
  if (metrics.trafficTrend === "down") score -= Math.min(12, metrics.trafficTrendPercent * 0.6);
  score += metrics.averagePosition <= 10 ? 10 : metrics.averagePosition <= 15 ? 6 : 0;
  return clampScore(score);
}

function calculateCtrScore(metrics: SearchConsoleMetrics): number {
  let score = 40;
  score += Math.min(35, metrics.ctr * 6);
  if (metrics.ctr >= 5) score += 10;
  if (metrics.ctr < 2) score -= 10;
  return clampScore(score);
}

function calculateSeoHealthScore(
  metrics: SearchConsoleMetrics,
  organicTrafficScore: number,
  ctrScore: number,
): number {
  let score = (organicTrafficScore + ctrScore + metrics.coreWebVitalsScore) / 3;
  score -= Math.min(15, metrics.indexErrors * 3);
  score -= Math.min(10, metrics.indexWarnings * 1.5);
  score += Math.min(10, metrics.keywordOpportunities.length * 2);
  return clampScore(score);
}

function buildRisks(metrics: SearchConsoleMetrics): SearchConsoleInsightItem[] {
  const risks: SearchConsoleInsightItem[] = [];
  let index = 0;

  if (metrics.indexErrors > 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Erros de indexação",
      description: `${metrics.indexErrors} erro(s) de indexação detectados no Search Console.`,
      severity: metrics.indexErrors >= 5 ? "critical" : "high",
    });
  }

  if (metrics.averagePosition > 15) {
    risks.push({
      id: `risk-${index++}`,
      title: "Posição média elevada",
      description: `Posição média ${metrics.averagePosition} — conteúdo abaixo da primeira página.`,
      severity: metrics.averagePosition > 20 ? "high" : "medium",
    });
  }

  if (metrics.ctr < 2.5) {
    risks.push({
      id: `risk-${index++}`,
      title: "CTR orgânico baixo",
      description: `CTR em ${metrics.ctr}% — otimizar titles e meta descriptions.`,
      severity: "medium",
    });
  }

  if (metrics.coreWebVitalsScore < 70) {
    risks.push({
      id: `risk-${index++}`,
      title: "Core Web Vitals abaixo do ideal",
      description: `CWV em ${metrics.coreWebVitalsScore}/100 — impacto em ranking e UX.`,
      severity: metrics.coreWebVitalsScore < 50 ? "high" : "medium",
    });
  }

  for (const issue of metrics.indexingIssues.filter(
    (item) => item.severity === "critical" || item.severity === "high",
  )) {
    risks.push({
      id: `risk-${index++}`,
      title: issue.type,
      description: issue.description,
      severity: issue.severity,
    });
  }

  return risks.slice(0, 5);
}

function buildRecommendations(
  risks: SearchConsoleInsightItem[],
  metrics: SearchConsoleMetrics,
  input: SearchConsoleExecutiveInput,
): SearchConsoleRecommendation[] {
  const recs: SearchConsoleRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const opportunity of metrics.keywordOpportunities.slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Otimizar keyword: ${opportunity.query}`,
      description: `Posição ${opportunity.position} com ${opportunity.impressions.toLocaleString("pt-BR")} impressões — potencial +${opportunity.potentialClicks} cliques.`,
      priority: "high",
    });
  }

  if (metrics.coreWebVitals.some((metric) => metric.status === "needs_improvement")) {
    recs.push({
      id: `rec-${index++}`,
      title: "Melhorar Core Web Vitals",
      description: "Priorizar LCP/INP/CLS nas páginas com maior tráfego orgânico.",
      priority: "high",
    });
  }

  for (const action of input.strategy?.marketingStrategy.actions.slice(0, 1) ?? []) {
    if (/seo|orgânico|organico|search|keyword|conteúdo/i.test(action)) {
      recs.push({
        id: `rec-${index++}`,
        title: action.split(/[.—]/)[0]?.trim() ?? "Ação SEO",
        description: action,
        priority: "medium",
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Monitorar Search Console semanalmente",
      description: "Revisar queries, páginas, indexação e CWV com cadência executiva.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  seoHealthScore: number,
  metrics: SearchConsoleMetrics,
): string {
  const trendLabel =
    metrics.trafficTrend === "up"
      ? `alta ${metrics.trafficTrendPercent}%`
      : metrics.trafficTrend === "down"
        ? `queda ${metrics.trafficTrendPercent}%`
        : "estável";

  return `${companyName} — Google Search Console com SEO Health ${seoHealthScore}/100. ${metrics.clicks.toLocaleString("pt-BR")} cliques · ${metrics.impressions.toLocaleString("pt-BR")} impressões · CTR ${metrics.ctr}% · posição ${metrics.averagePosition} · tendência ${trendLabel}. Inteligência orgânica integrada ao CEO Digital Samuel AI™.`;
}

export function buildSearchConsoleExecutive(
  input: SearchConsoleExecutiveInput = {},
): SearchConsoleExecutive {
  const metrics = resolveMetrics(input);
  const companyName = input.companyName ?? "Empresa";

  const searchConsoleRisks = buildRisks(metrics);
  const searchConsoleRecommendations = buildRecommendations(
    searchConsoleRisks,
    metrics,
    input,
  );

  return {
    seoHealthScore: metrics.seoHealthScore,
    organicTrafficScore: metrics.organicTrafficScore,
    coreWebVitalsScore: metrics.coreWebVitalsScore,
    ctrScore: metrics.ctrScore,
    impressions: metrics.impressions,
    clicks: metrics.clicks,
    averagePosition: metrics.averagePosition,
    ctr: metrics.ctr,
    keywordOpportunities: metrics.keywordOpportunities,
    topQueries: metrics.topQueries,
    topPages: metrics.topPages,
    indexingIssues: metrics.indexingIssues,
    coreWebVitals: metrics.coreWebVitals,
    searchConsoleRisks,
    searchConsoleRecommendations,
    searchConsoleExecutiveSummary: buildSummary(
      companyName,
      metrics.seoHealthScore,
      metrics,
    ),
  };
}
