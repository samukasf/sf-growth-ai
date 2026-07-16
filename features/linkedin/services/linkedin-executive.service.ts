import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type LinkedInMetrics = {
  followers: number;
  followerGrowthPercent: number;
  impressions: number;
  reach: number;
  clicks: number;
  profileViews: number;
  engagementRate: number;
  employeeShares: number;
  leadsGenerated: number;
  pageCompleteness: number;
};

export type LinkedInPostPerformance = {
  id: string;
  title: string;
  format: string;
  engagement: number;
  impressions: number;
  reason: string;
};

export type LinkedInInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type LinkedInRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type LinkedInExecutive = {
  linkedInHealthScore: number;
  companyPageScore: number;
  followerGrowthScore: number;
  engagementScore: number;
  impressions: number;
  reach: number;
  clicks: number;
  profileViews: number;
  employeeAdvocacyScore: number;
  brandAuthorityScore: number;
  contentPerformance: number;
  bestPosts: LinkedInPostPerformance[];
  weakPosts: LinkedInPostPerformance[];
  leadGenerationScore: number;
  b2bOpportunityScore: number;
  linkedInRisks: LinkedInInsightItem[];
  linkedInOpportunities: LinkedInInsightItem[];
  linkedInRecommendations: LinkedInRecommendation[];
  linkedInExecutiveSummary: string;
};

export type LinkedInExecutiveInput = {
  metrics?: LinkedInMetrics;
  bestPosts?: LinkedInPostPerformance[];
  weakPosts?: LinkedInPostPerformance[];
  /** When false, missing metrics throws instead of using demo fixtures. */
  allowMockFallback?: boolean;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
  crmExecutive?: CrmExecutive | null;
  salesExecutive?: SalesExecutive | null;
};

const MOCK_METRICS: LinkedInMetrics = {
  followers: 12480,
  followerGrowthPercent: 6.2,
  impressions: 98400,
  reach: 42800,
  clicks: 1860,
  profileViews: 3240,
  engagementRate: 4.1,
  employeeShares: 86,
  leadsGenerated: 42,
  pageCompleteness: 88,
};

const MOCK_BEST_POSTS: LinkedInPostPerformance[] = [
  {
    id: "li-1",
    title: "Thought leadership — Tendências B2B 2026",
    format: "Carrossel",
    engagement: 1240,
    impressions: 18500,
    reason: "Alto save rate e comentários de decisores",
  },
  {
    id: "li-2",
    title: "Case study — ROI em 90 dias",
    format: "Documento",
    engagement: 980,
    impressions: 14200,
    reason: "CTR 3.2% · leads qualificados",
  },
  {
    id: "li-3",
    title: "Founder post — Visão executiva",
    format: "Texto longo",
    engagement: 860,
    impressions: 12800,
    reason: "Alcance orgânico acima da média",
  },
];

const MOCK_WEAK_POSTS: LinkedInPostPerformance[] = [
  {
    id: "li-w1",
    title: "Post genérico institucional",
    format: "Imagem",
    engagement: 42,
    impressions: 2100,
    reason: "Baixo engagement · sem CTA B2B",
  },
  {
    id: "li-w2",
    title: "Anúncio de evento sem segmentação",
    format: "Link",
    engagement: 68,
    impressions: 3400,
    reason: "Cliques baixos apesar do alcance",
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveMetrics(input: LinkedInExecutiveInput): LinkedInMetrics {
  if (input.metrics) return input.metrics;
  if (input.allowMockFallback === false) {
    throw new Error("LinkedIn executive requer métricas reais da API.");
  }
  return MOCK_METRICS;
}

function calculateCompanyPageScore(metrics: LinkedInMetrics): number {
  let score = 50;
  score += Math.min(30, metrics.pageCompleteness * 0.3);
  score += Math.min(15, (metrics.profileViews / 5000) * 100 * 0.15);
  return clampScore(score);
}

function calculateFollowerGrowthScore(metrics: LinkedInMetrics): number {
  let score = 45;
  score += Math.min(35, metrics.followerGrowthPercent * 4);
  score += Math.min(15, (metrics.followers / 20000) * 100 * 0.15);
  return clampScore(score);
}

function calculateEngagementScore(metrics: LinkedInMetrics): number {
  let score = 40;
  score += Math.min(35, (metrics.engagementRate / 6) * 100 * 0.35);
  score += Math.min(15, (metrics.clicks / 3000) * 100 * 0.15);
  return clampScore(score);
}

function calculateEmployeeAdvocacyScore(metrics: LinkedInMetrics): number {
  let score = 55;
  score += Math.min(30, metrics.employeeShares * 0.35);
  if (metrics.employeeShares >= 50) score += 10;
  return clampScore(score);
}

function calculateBrandAuthorityScore(
  metrics: LinkedInMetrics,
  input: LinkedInExecutiveInput,
): number {
  let score = 50;
  score += Math.min(20, (metrics.followers / 15000) * 100 * 0.2);
  score += Math.min(15, (metrics.engagementRate / 5) * 100 * 0.15);
  score += Math.min(10, (input.marketingExecutive?.brandScore ?? 0) * 0.1);
  return clampScore(score);
}

function calculateContentPerformance(
  best: LinkedInPostPerformance[],
  weak: LinkedInPostPerformance[],
): number {
  let score = 55;
  score += Math.min(25, best.length * 7);
  score -= Math.min(15, weak.length * 6);
  return clampScore(score);
}

function calculateLeadGenerationScore(
  metrics: LinkedInMetrics,
  input: LinkedInExecutiveInput,
): number {
  let score = 45;
  score += Math.min(30, (metrics.leadsGenerated / 60) * 100 * 0.3);
  score += Math.min(15, (metrics.clicks / 2500) * 100 * 0.15);
  score += Math.min(10, (input.crmExecutive?.activeLeads ?? 0) * 2);
  return clampScore(score);
}

function calculateB2bOpportunityScore(input: LinkedInExecutiveInput): number {
  let score = 50;
  score += Math.min(20, (input.salesExecutive?.openOpportunities.length ?? 0) * 5);
  score += Math.min(15, (input.crmExecutive?.pipelineValue ?? 0) > 50000 ? 15 : 0);
  score += Math.min(10, (input.competitor?.opportunities.length ?? 0) * 3);
  return clampScore(score);
}

function buildLinkedInRisks(
  metrics: LinkedInMetrics,
  weakPosts: LinkedInPostPerformance[],
): LinkedInInsightItem[] {
  const risks: LinkedInInsightItem[] = [];
  let index = 0;

  if (metrics.engagementRate < 3) {
    risks.push({
      id: `risk-${index++}`,
      title: "Engagement abaixo do benchmark B2B",
      description: `Taxa ${metrics.engagementRate}% — revisar formato e tom executivo.`,
      severity: "high",
    });
  }

  if (weakPosts.length >= 2) {
    risks.push({
      id: `risk-${index++}`,
      title: "Conteúdo com baixa performance",
      description: `${weakPosts.length} post(s) abaixo do benchmark — evitar formatos similares.`,
      severity: "medium",
    });
  }

  if (metrics.employeeShares < 30) {
    risks.push({
      id: `risk-${index++}`,
      title: "Baixa advocacy dos colaboradores",
      description: "Poucos compartilhamentos internos — limita alcance orgânico.",
      severity: "medium",
    });
  }

  if (metrics.pageCompleteness < 85) {
    risks.push({
      id: `risk-${index++}`,
      title: "Página da empresa incompleta",
      description: `Completude ${metrics.pageCompleteness}% — otimizar seções e CTA.`,
      severity: "high",
    });
  }

  return risks.slice(0, 5);
}

function buildLinkedInOpportunities(
  metrics: LinkedInMetrics,
  bestPosts: LinkedInPostPerformance[],
  input: LinkedInExecutiveInput,
): LinkedInInsightItem[] {
  const opportunities: LinkedInInsightItem[] = [];
  let index = 0;

  for (const post of bestPosts.slice(0, 2)) {
    opportunities.push({
      id: `opp-${index++}`,
      title: `Replicar: ${post.title}`,
      description: `${post.format} · ${post.reason}`,
      severity: "high",
    });
  }

  if (metrics.leadsGenerated >= 30) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Pipeline LinkedIn ativo",
      description: `${metrics.leadsGenerated} leads gerados — integrar com CRM e vendas.`,
      severity: "high",
    });
  }

  if (metrics.followerGrowthPercent >= 5) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Momentum de crescimento",
      description: `+${metrics.followerGrowthPercent}% seguidores — acelerar thought leadership.`,
      severity: "medium",
    });
  }

  if ((input.salesExecutive?.highValueDeals.length ?? 0) > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Alinhar conteúdo ao pipeline",
      description: "Deals de alto valor exigem narrativa executiva no LinkedIn.",
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildLinkedInRecommendations(
  risks: LinkedInInsightItem[],
  opportunities: LinkedInInsightItem[],
  weakPosts: LinkedInPostPerformance[],
  input: LinkedInExecutiveInput,
): LinkedInRecommendation[] {
  const recs: LinkedInRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const post of weakPosts.slice(0, 1)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Revisar: ${post.title}`,
      description: post.reason,
      priority: "high",
    });
  }

  for (const action of input.strategy?.marketingStrategy.actions.slice(0, 1) ?? []) {
    if (/linkedin|b2b|thought|executiv/i.test(action)) {
      recs.push({
        id: `rec-${index++}`,
        title: action.split(/[.—]/)[0]?.trim() ?? "Ação LinkedIn",
        description: action,
        priority: "medium",
      });
    }
  }

  for (const opp of opportunities.slice(0, 1)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Capturar: ${opp.title}`,
      description: opp.description,
      priority: "medium",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      title: "Manter cadência LinkedIn B2B",
      description: "Publicar 3–4x/semana com mix de thought leadership, cases e employee advocacy.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  brandAuthorityScore: number,
  leadGenerationScore: number,
  reach: number,
): string {
  return `${companyName} — LinkedIn executivo com saúde ${healthScore}/100. Autoridade ${brandAuthorityScore}/100 · Leads B2B ${leadGenerationScore}/100 · Alcance ${reach.toLocaleString("pt-BR")}. Inteligência LinkedIn integrada ao CEO Digital Samuel AI™.`;
}

export function buildLinkedInExecutive(input: LinkedInExecutiveInput = {}): LinkedInExecutive {
  const metrics = resolveMetrics(input);
  const companyName = input.companyName ?? "Empresa";

  const allowMock = input.allowMockFallback !== false;
  const bestPosts =
    input.bestPosts?.map((p) => ({ ...p })) ??
    (allowMock ? MOCK_BEST_POSTS.map((p) => ({ ...p })) : []);
  const weakPosts =
    input.weakPosts?.map((p) => ({ ...p })) ??
    (allowMock ? MOCK_WEAK_POSTS.map((p) => ({ ...p })) : []);

  const companyPageScore = calculateCompanyPageScore(metrics);
  const followerGrowthScore = calculateFollowerGrowthScore(metrics);
  const engagementScore = calculateEngagementScore(metrics);
  const employeeAdvocacyScore = calculateEmployeeAdvocacyScore(metrics);
  const brandAuthorityScore = calculateBrandAuthorityScore(metrics, input);
  const contentPerformance = calculateContentPerformance(bestPosts, weakPosts);
  const leadGenerationScore = calculateLeadGenerationScore(metrics, input);
  const b2bOpportunityScore = calculateB2bOpportunityScore(input);

  const linkedInRisks = buildLinkedInRisks(metrics, weakPosts);
  const linkedInOpportunities = buildLinkedInOpportunities(metrics, bestPosts, input);
  const linkedInRecommendations = buildLinkedInRecommendations(
    linkedInRisks,
    linkedInOpportunities,
    weakPosts,
    input,
  );

  const linkedInHealthScore = clampScore(
    (companyPageScore +
      followerGrowthScore +
      engagementScore +
      employeeAdvocacyScore +
      brandAuthorityScore +
      contentPerformance +
      leadGenerationScore +
      b2bOpportunityScore) /
      8,
  );

  return {
    linkedInHealthScore,
    companyPageScore,
    followerGrowthScore,
    engagementScore,
    impressions: metrics.impressions,
    reach: metrics.reach,
    clicks: metrics.clicks,
    profileViews: metrics.profileViews,
    employeeAdvocacyScore,
    brandAuthorityScore,
    contentPerformance,
    bestPosts,
    weakPosts,
    leadGenerationScore,
    b2bOpportunityScore,
    linkedInRisks,
    linkedInOpportunities,
    linkedInRecommendations,
    linkedInExecutiveSummary: buildSummary(
      companyName,
      linkedInHealthScore,
      brandAuthorityScore,
      leadGenerationScore,
      metrics.reach,
    ),
  };
}
