import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type MetaPlatformMetrics = {
  facebookFollowers: number;
  instagramFollowers: number;
  facebookEngagementRate: number;
  instagramEngagementRate: number;
  facebookReach: number;
  instagramReach: number;
  impressions: number;
  reach: number;
  engagement: number;
  followers: number;
  comments: number;
  shares: number;
  savedPosts: number;
  followersGrowthPercent: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  adSpend: number;
  adRevenue: number;
};

export type MetaPostPerformance = {
  id: string;
  title: string;
  platform: "facebook" | "instagram";
  engagement: number;
  reach: number;
  reason: string;
};

export type MetaInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type MetaRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type MetaExecutive = {
  metaHealthScore: number;
  facebookScore: number;
  instagramScore: number;
  contentScore: number;
  engagementScore: number;
  reachScore: number;
  followersGrowthScore: number;
  paidAdsScore: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  impressions: number;
  reach: number;
  engagement: number;
  followers: number;
  comments: number;
  shares: number;
  savedPosts: number;
  bestPerformingPosts: MetaPostPerformance[];
  weakPerformingPosts: MetaPostPerformance[];
  metaRisks: MetaInsightItem[];
  metaOpportunities: MetaInsightItem[];
  metaRecommendations: MetaRecommendation[];
  metaExecutiveSummary: string;
};

export type MetaExecutiveInput = {
  metrics?: MetaPlatformMetrics;
  bestPerformingPosts?: MetaPostPerformance[];
  weakPerformingPosts?: MetaPostPerformance[];
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

const MOCK_METRICS: MetaPlatformMetrics = {
  facebookFollowers: 8420,
  instagramFollowers: 15680,
  facebookEngagementRate: 3.2,
  instagramEngagementRate: 5.8,
  facebookReach: 28400,
  instagramReach: 45200,
  impressions: 186500,
  reach: 73600,
  engagement: 12480,
  followers: 24100,
  comments: 1840,
  shares: 920,
  savedPosts: 640,
  followersGrowthPercent: 8.4,
  ctr: 2.35,
  cpc: 1.82,
  cpm: 12.4,
  roas: 3.6,
  adSpend: 8400,
  adRevenue: 30240,
};

const MOCK_BEST_POSTS: MetaPostPerformance[] = [
  {
    id: "post-1",
    title: "Case de sucesso — Cliente Enterprise",
    platform: "instagram",
    engagement: 2840,
    reach: 18500,
    reason: "Carrossel com prova social · 5.8% ER",
  },
  {
    id: "post-2",
    title: "Live Q&A — Estratégia de Growth",
    platform: "facebook",
    engagement: 1620,
    reach: 12400,
    reason: "Alto tempo de visualização e comentários",
  },
  {
    id: "post-3",
    title: "Reels — Bastidores do time",
    platform: "instagram",
    engagement: 1980,
    reach: 22100,
    reason: "Formato vertical com retenção acima da média",
  },
];

const MOCK_WEAK_POSTS: MetaPostPerformance[] = [
  {
    id: "post-w1",
    title: "Post institucional genérico",
    platform: "facebook",
    engagement: 84,
    reach: 3200,
    reason: "Baixo CTR · sem CTA claro",
  },
  {
    id: "post-w2",
    title: "Promoção sem segmentação",
    platform: "instagram",
    engagement: 120,
    reach: 4100,
    reason: "Alcance alto, conversão baixa",
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveMetrics(input: MetaExecutiveInput): MetaPlatformMetrics {
  return input.metrics ?? MOCK_METRICS;
}

function calculateFacebookScore(metrics: MetaPlatformMetrics): number {
  let score = 45;
  score += Math.min(20, (metrics.facebookFollowers / 15000) * 100 * 0.2);
  score += Math.min(25, (metrics.facebookEngagementRate / 6) * 100 * 0.25);
  score += Math.min(15, (metrics.facebookReach / 50000) * 100 * 0.15);
  return clampScore(score);
}

function calculateInstagramScore(metrics: MetaPlatformMetrics): number {
  let score = 50;
  score += Math.min(20, (metrics.instagramFollowers / 25000) * 100 * 0.2);
  score += Math.min(25, (metrics.instagramEngagementRate / 8) * 100 * 0.25);
  score += Math.min(15, (metrics.instagramReach / 60000) * 100 * 0.15);
  return clampScore(score);
}

function calculateContentScore(
  best: MetaPostPerformance[],
  weak: MetaPostPerformance[],
): number {
  let score = 55;
  score += Math.min(20, best.length * 6);
  score -= Math.min(15, weak.length * 5);
  return clampScore(score);
}

function calculateEngagementScore(metrics: MetaPlatformMetrics): number {
  const avgEr = (metrics.facebookEngagementRate + metrics.instagramEngagementRate) / 2;
  let score = 40;
  score += Math.min(35, (avgEr / 6) * 100 * 0.35);
  score += Math.min(15, (metrics.engagement / 20000) * 100 * 0.15);
  return clampScore(score);
}

function calculateReachScore(metrics: MetaPlatformMetrics): number {
  let score = 45;
  score += Math.min(30, (metrics.reach / 100000) * 100 * 0.3);
  score += Math.min(20, (metrics.impressions / 250000) * 100 * 0.2);
  return clampScore(score);
}

function calculateFollowersGrowthScore(metrics: MetaPlatformMetrics): number {
  let score = 50;
  score += Math.min(35, metrics.followersGrowthPercent * 3.5);
  if (metrics.followersGrowthPercent >= 10) score += 10;
  return clampScore(score);
}

function calculatePaidAdsScore(metrics: MetaPlatformMetrics): number {
  let score = 40;
  score += Math.min(25, (metrics.roas / 5) * 100 * 0.25);
  score += Math.min(15, (metrics.ctr / 4) * 100 * 0.15);
  score -= Math.min(10, metrics.cpc > 3 ? 10 : 0);
  return clampScore(score);
}

function buildBestPosts(): MetaPostPerformance[] {
  return MOCK_BEST_POSTS.map((p) => ({ ...p }));
}

function buildWeakPosts(): MetaPostPerformance[] {
  return MOCK_WEAK_POSTS.map((p) => ({ ...p }));
}

function buildMetaRisks(
  metrics: MetaPlatformMetrics,
  weakPosts: MetaPostPerformance[],
): MetaInsightItem[] {
  const risks: MetaInsightItem[] = [];
  let index = 0;

  if (metrics.roas < 2.5) {
    risks.push({
      id: `risk-${index++}`,
      title: "ROAS abaixo do ideal",
      description: `Retorno ${metrics.roas}x — revisar criativos, público e landing pages.`,
      severity: metrics.roas < 2 ? "critical" : "high",
    });
  }

  if (metrics.facebookEngagementRate < 2.5) {
    risks.push({
      id: `risk-${index++}`,
      title: "Engagement Facebook baixo",
      description: `Taxa ${metrics.facebookEngagementRate}% — conteúdo pouco ressonante.`,
      severity: "high",
    });
  }

  if (weakPosts.length >= 2) {
    risks.push({
      id: `risk-${index++}`,
      title: "Posts com baixa performance",
      description: `${weakPosts.length} conteúdo(s) abaixo do benchmark — pausar formatos similares.`,
      severity: "medium",
    });
  }

  if (metrics.cpc > 2.5) {
    risks.push({
      id: `risk-${index++}`,
      title: "CPC elevado",
      description: `Custo por clique R$ ${metrics.cpc.toFixed(2)} — otimizar segmentação.`,
      severity: "medium",
    });
  }

  return risks.slice(0, 5);
}

function buildMetaOpportunities(
  metrics: MetaPlatformMetrics,
  bestPosts: MetaPostPerformance[],
  input: MetaExecutiveInput,
): MetaInsightItem[] {
  const opportunities: MetaInsightItem[] = [];
  let index = 0;

  for (const post of bestPosts.slice(0, 2)) {
    opportunities.push({
      id: `opp-${index++}`,
      title: `Escalar: ${post.title}`,
      description: `${post.platform === "instagram" ? "Instagram" : "Facebook"} · ${post.reason}`,
      severity: "high",
    });
  }

  if (metrics.instagramEngagementRate > metrics.facebookEngagementRate) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Priorizar Instagram",
      description: `ER Instagram ${metrics.instagramEngagementRate}% vs Facebook ${metrics.facebookEngagementRate}%.`,
      severity: "high",
    });
  }

  if (metrics.roas >= 3) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Escalar budget de ads",
      description: `ROAS ${metrics.roas}x sustenta aumento gradual de investimento.`,
      severity: "medium",
    });
  }

  if ((input.marketingExecutive?.paidMediaScore ?? 0) >= 60) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Sinergia com marketing pago",
      description: "Alinhar campanhas Meta com funil de conversão do marketing executivo.",
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildMetaRecommendations(
  risks: MetaInsightItem[],
  opportunities: MetaInsightItem[],
  weakPosts: MetaPostPerformance[],
  input: MetaExecutiveInput,
): MetaRecommendation[] {
  const recs: MetaRecommendation[] = [];
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
    if (/meta|facebook|instagram|social|ads/i.test(action)) {
      recs.push({
        id: `rec-${index++}`,
        title: action.split(/[.—]/)[0]?.trim() ?? "Ação Meta",
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
      title: "Manter cadência Meta",
      description: "Publicar 4–5x/semana no Instagram e 3x/semana no Facebook com testes A/B.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  reach: number,
  engagementScore: number,
  roas: number,
): string {
  return `${companyName} — Meta (Facebook & Instagram) com saúde ${healthScore}/100. Alcance ${reach.toLocaleString("pt-BR")} · Engagement ${engagementScore}/100 · ROAS ${roas}x. Inteligência social integrada ao CEO Digital Samuel AI™.`;
}

export function buildMetaExecutive(input: MetaExecutiveInput = {}): MetaExecutive {
  const metrics = resolveMetrics(input);
  const companyName = input.companyName ?? "Empresa";

  const facebookScore = calculateFacebookScore(metrics);
  const instagramScore = calculateInstagramScore(metrics);
  const bestPerformingPosts = input.bestPerformingPosts ?? buildBestPosts();
  const weakPerformingPosts = input.weakPerformingPosts ?? buildWeakPosts();
  const contentScore = calculateContentScore(bestPerformingPosts, weakPerformingPosts);
  const engagementScore = calculateEngagementScore(metrics);
  const reachScore = calculateReachScore(metrics);
  const followersGrowthScore = calculateFollowersGrowthScore(metrics);
  const paidAdsScore = calculatePaidAdsScore(metrics);

  const metaRisks = buildMetaRisks(metrics, weakPerformingPosts);
  const metaOpportunities = buildMetaOpportunities(metrics, bestPerformingPosts, input);
  const metaRecommendations = buildMetaRecommendations(
    metaRisks,
    metaOpportunities,
    weakPerformingPosts,
    input,
  );

  const metaHealthScore = clampScore(
    (facebookScore +
      instagramScore +
      contentScore +
      engagementScore +
      reachScore +
      followersGrowthScore +
      paidAdsScore) /
      7,
  );

  return {
    metaHealthScore,
    facebookScore,
    instagramScore,
    contentScore,
    engagementScore,
    reachScore,
    followersGrowthScore,
    paidAdsScore,
    ctr: metrics.ctr,
    cpc: metrics.cpc,
    cpm: metrics.cpm,
    roas: metrics.roas,
    impressions: metrics.impressions,
    reach: metrics.reach,
    engagement: metrics.engagement,
    followers: metrics.followers,
    comments: metrics.comments,
    shares: metrics.shares,
    savedPosts: metrics.savedPosts,
    bestPerformingPosts,
    weakPerformingPosts,
    metaRisks,
    metaOpportunities,
    metaRecommendations,
    metaExecutiveSummary: buildSummary(
      companyName,
      metaHealthScore,
      metrics.reach,
      engagementScore,
      metrics.roas,
    ),
  };
}
