import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type GoogleBusinessMetrics = {
  totalReviews: number;
  averageRating: number;
  unansweredReviews: number;
  directionRequests: number;
  calls: number;
  websiteClicks: number;
  photoViews: number;
  searchAppearances: number;
  rankingPosition: string;
  profileCompleteness: number;
};

export type GoogleBusinessInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type GoogleBusinessRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type GoogleBusinessExecutive = {
  googleBusinessHealthScore: number;
  visibilityScore: number;
  reviewsScore: number;
  reputationScore: number;
  localSeoScore: number;
  profileCompletenessScore: number;
  rankingPosition: string;
  totalReviews: number;
  averageRating: number;
  unansweredReviews: number;
  directionRequests: number;
  calls: number;
  websiteClicks: number;
  photoViews: number;
  searchAppearances: number;
  googleBusinessRisks: GoogleBusinessInsightItem[];
  googleBusinessOpportunities: GoogleBusinessInsightItem[];
  googleBusinessRecommendations: GoogleBusinessRecommendation[];
  googleBusinessExecutiveSummary: string;
};

export type GoogleBusinessExecutiveInput = {
  metrics?: GoogleBusinessMetrics;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

const MOCK_METRICS: GoogleBusinessMetrics = {
  totalReviews: 127,
  averageRating: 4.6,
  unansweredReviews: 8,
  directionRequests: 342,
  calls: 89,
  websiteClicks: 156,
  photoViews: 1240,
  searchAppearances: 5280,
  rankingPosition: "#2 no Local Pack",
  profileCompleteness: 82,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveMetrics(input: GoogleBusinessExecutiveInput): GoogleBusinessMetrics {
  return input.metrics ?? MOCK_METRICS;
}

function calculateVisibilityScore(metrics: GoogleBusinessMetrics): number {
  let score = 40;
  score += Math.min(25, (metrics.searchAppearances / 10000) * 100 * 0.25);
  score += Math.min(15, (metrics.directionRequests / 500) * 100 * 0.15);
  score += Math.min(10, metrics.profileCompleteness * 0.1);
  if (metrics.rankingPosition.includes("#1")) score += 15;
  else if (metrics.rankingPosition.includes("#2")) score += 10;
  else if (metrics.rankingPosition.includes("#3")) score += 6;
  return clampScore(score);
}

function calculateReviewsScore(metrics: GoogleBusinessMetrics): number {
  let score = 50;
  score += Math.min(25, (metrics.totalReviews / 200) * 100 * 0.25);
  score += Math.min(20, (metrics.averageRating / 5) * 100 * 0.2);
  score -= Math.min(25, metrics.unansweredReviews * 3);
  return clampScore(score);
}

function calculateReputationScore(metrics: GoogleBusinessMetrics): number {
  let score = 45;
  score += Math.min(35, (metrics.averageRating / 5) * 100 * 0.35);
  score += Math.min(15, Math.min(metrics.totalReviews, 150) * 0.1);
  score -= Math.min(20, metrics.unansweredReviews * 2.5);
  if (metrics.averageRating >= 4.5) score += 10;
  return clampScore(score);
}

function calculateLocalSeoScore(
  metrics: GoogleBusinessMetrics,
  input: GoogleBusinessExecutiveInput,
): number {
  let score = 50;
  score += Math.min(20, metrics.profileCompleteness * 0.2);
  score += Math.min(15, (metrics.searchAppearances / 8000) * 100 * 0.15);
  score += Math.min(10, (input.marketingExecutive?.seoScore ?? 0) * 0.1);
  if (metrics.rankingPosition.toLowerCase().includes("pack")) score += 8;
  return clampScore(score);
}

function buildRisks(metrics: GoogleBusinessMetrics): GoogleBusinessInsightItem[] {
  const risks: GoogleBusinessInsightItem[] = [];
  let index = 0;

  if (metrics.unansweredReviews >= 5) {
    risks.push({
      id: `risk-${index++}`,
      title: "Avaliações sem resposta",
      description: `${metrics.unansweredReviews} review(s) aguardando resposta — impacto na reputação local.`,
      severity: metrics.unansweredReviews >= 10 ? "critical" : "high",
    });
  }

  if (metrics.profileCompleteness < 85) {
    risks.push({
      id: `risk-${index++}`,
      title: "Perfil incompleto",
      description: `Completude em ${metrics.profileCompleteness}% — campos essenciais pendentes no Google Business Profile.`,
      severity: metrics.profileCompleteness < 70 ? "high" : "medium",
    });
  }

  if (metrics.averageRating < 4.2) {
    risks.push({
      id: `risk-${index++}`,
      title: "Nota média abaixo do ideal",
      description: `Rating ${metrics.averageRating}/5 — monitorar feedback e plano de recuperação.`,
      severity: metrics.averageRating < 3.8 ? "critical" : "high",
    });
  }

  if (!metrics.rankingPosition.includes("#1")) {
    risks.push({
      id: `risk-${index++}`,
      title: "Posicionamento local competitivo",
      description: `Posição atual: ${metrics.rankingPosition} — concorrentes podem capturar buscas locais.`,
      severity: "medium",
    });
  }

  return risks.slice(0, 5);
}

function buildOpportunities(
  metrics: GoogleBusinessMetrics,
  input: GoogleBusinessExecutiveInput,
): GoogleBusinessInsightItem[] {
  const opportunities: GoogleBusinessInsightItem[] = [];
  let index = 0;

  if (metrics.photoViews > 800) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Engajamento visual alto",
      description: `${metrics.photoViews.toLocaleString("pt-BR")} visualizações de fotos — ampliar galeria e posts.`,
      severity: "high",
    });
  }

  if (metrics.calls + metrics.websiteClicks > 200) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Conversão local ativa",
      description: `${metrics.calls} chamadas e ${metrics.websiteClicks} cliques no site — otimizar CTAs no perfil.`,
      severity: "high",
    });
  }

  if ((input.marketingExecutive?.topChannels.length ?? 0) > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Sinergia com marketing digital",
      description: "Integrar campanhas pagas com perfil Google para capturar intenção local.",
      severity: "medium",
    });
  }

  for (const opp of input.intelligence?.opportunities.slice(0, 1) ?? []) {
    if (/local|google|maps|seo|reput/i.test(opp)) {
      opportunities.push({
        id: `opp-${index++}`,
        title: opp.split(/[.—]/)[0]?.trim() ?? opp.slice(0, 60),
        description: opp,
        severity: "medium",
      });
    }
  }

  return opportunities.slice(0, 5);
}

function buildRecommendations(
  risks: GoogleBusinessInsightItem[],
  opportunities: GoogleBusinessInsightItem[],
  metrics: GoogleBusinessMetrics,
  input: GoogleBusinessExecutiveInput,
): GoogleBusinessRecommendation[] {
  const recs: GoogleBusinessRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  if (metrics.unansweredReviews > 0) {
    recs.push({
      id: `rec-${index++}`,
      title: "Responder avaliações pendentes",
      description: `Responder ${metrics.unansweredReviews} review(s) em até 48h com tom profissional e personalizado.`,
      priority: "high",
    });
  }

  for (const action of input.strategy?.marketingStrategy.actions.slice(0, 1) ?? []) {
    if (/local|google|maps|review|reput/i.test(action)) {
      recs.push({
        id: `rec-${index++}`,
        title: action.split(/[.—]/)[0]?.trim() ?? "Ação local",
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
      title: "Manter cadência no Google Business",
      description: "Publicar posts semanais, atualizar fotos e monitorar reviews e métricas locais.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  visibilityScore: number,
  averageRating: number,
  rankingPosition: string,
): string {
  return `${companyName} — Google Business Profile com saúde ${healthScore}/100. Visibilidade ${visibilityScore}/100 · Rating ${averageRating}/5 · ${rankingPosition}. Inteligência local integrada ao CEO Digital Samuel AI™.`;
}

export function buildGoogleBusinessExecutive(
  input: GoogleBusinessExecutiveInput = {},
): GoogleBusinessExecutive {
  const metrics = resolveMetrics(input);
  const companyName = input.companyName ?? "Empresa";

  const visibilityScore = calculateVisibilityScore(metrics);
  const reviewsScore = calculateReviewsScore(metrics);
  const reputationScore = calculateReputationScore(metrics);
  const localSeoScore = calculateLocalSeoScore(metrics, input);
  const profileCompletenessScore = clampScore(metrics.profileCompleteness);

  const googleBusinessRisks = buildRisks(metrics);
  const googleBusinessOpportunities = buildOpportunities(metrics, input);
  const googleBusinessRecommendations = buildRecommendations(
    googleBusinessRisks,
    googleBusinessOpportunities,
    metrics,
    input,
  );

  const googleBusinessHealthScore = clampScore(
    (visibilityScore +
      reviewsScore +
      reputationScore +
      localSeoScore +
      profileCompletenessScore) /
      5,
  );

  return {
    googleBusinessHealthScore,
    visibilityScore,
    reviewsScore,
    reputationScore,
    localSeoScore,
    profileCompletenessScore,
    rankingPosition: metrics.rankingPosition,
    totalReviews: metrics.totalReviews,
    averageRating: metrics.averageRating,
    unansweredReviews: metrics.unansweredReviews,
    directionRequests: metrics.directionRequests,
    calls: metrics.calls,
    websiteClicks: metrics.websiteClicks,
    photoViews: metrics.photoViews,
    searchAppearances: metrics.searchAppearances,
    googleBusinessRisks,
    googleBusinessOpportunities,
    googleBusinessRecommendations,
    googleBusinessExecutiveSummary: buildSummary(
      companyName,
      googleBusinessHealthScore,
      visibilityScore,
      metrics.averageRating,
      metrics.rankingPosition,
    ),
  };
}
