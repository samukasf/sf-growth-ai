import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type GoogleAnalyticsChannelMetric = {
  name: string;
  sessions: number;
  share: number;
};

export type GoogleAnalyticsPageMetric = {
  path: string;
  views: number;
  share: number;
};

export type GoogleAnalyticsEventMetric = {
  name: string;
  count: number;
  share: number;
};

export type GoogleAnalyticsDeviceMetric = {
  name: string;
  sessions: number;
  share: number;
};

export type GoogleAnalyticsCountryMetric = {
  name: string;
  users: number;
  share: number;
};

export type GoogleAnalyticsMetrics = {
  users: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  engagedSessions: number;
  engagementRate: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  realtimeUsers: number;
  trafficTrend: "up" | "down" | "stable";
  trafficTrendPercent: number;
  topChannels: GoogleAnalyticsChannelMetric[];
  topPages: GoogleAnalyticsPageMetric[];
  topEvents: GoogleAnalyticsEventMetric[];
  topDevices: GoogleAnalyticsDeviceMetric[];
  topCountries: GoogleAnalyticsCountryMetric[];
};

export type GoogleAnalyticsInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type GoogleAnalyticsRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type GoogleAnalyticsExecutive = {
  googleAnalyticsHealthScore: number;
  trafficScore: number;
  engagementScore: number;
  conversionScore: number;
  audienceScore: number;
  contentScore: number;
  users: number;
  sessions: number;
  conversions: number;
  conversionRate: number;
  pageViews: number;
  bounceRate: number;
  engagementRate: number;
  realtimeUsers: number;
  trafficTrend: "up" | "down" | "stable";
  trafficTrendPercent: number;
  topChannels: GoogleAnalyticsChannelMetric[];
  topPages: GoogleAnalyticsPageMetric[];
  topEvents: GoogleAnalyticsEventMetric[];
  googleAnalyticsRisks: GoogleAnalyticsInsightItem[];
  googleAnalyticsOpportunities: GoogleAnalyticsInsightItem[];
  googleAnalyticsRecommendations: GoogleAnalyticsRecommendation[];
  googleAnalyticsExecutiveSummary: string;
};

export type GoogleAnalyticsExecutiveInput = {
  metrics?: GoogleAnalyticsMetrics;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

const MOCK_METRICS: GoogleAnalyticsMetrics = {
  users: 8420,
  totalUsers: 9100,
  newUsers: 3240,
  sessions: 12450,
  engagedSessions: 7820,
  engagementRate: 62.8,
  conversions: 186,
  conversionRate: 1.49,
  totalRevenue: 42800,
  pageViews: 31200,
  bounceRate: 42.3,
  avgSessionDuration: 142,
  realtimeUsers: 24,
  trafficTrend: "up",
  trafficTrendPercent: 12,
  topChannels: [
    { name: "Organic Search", sessions: 4820, share: 39 },
    { name: "Direct", sessions: 2980, share: 24 },
    { name: "Paid Search", sessions: 2140, share: 17 },
    { name: "Social", sessions: 1520, share: 12 },
    { name: "Referral", sessions: 990, share: 8 },
  ],
  topPages: [
    { path: "/", views: 8420, share: 27 },
    { path: "/pricing", views: 5240, share: 17 },
    { path: "/blog/growth", views: 3180, share: 10 },
    { path: "/contact", views: 2640, share: 8 },
    { path: "/demo", views: 1980, share: 6 },
  ],
  topEvents: [
    { name: "page_view", count: 31200, share: 58 },
    { name: "scroll", count: 8420, share: 16 },
    { name: "click_cta", count: 2140, share: 4 },
    { name: "form_submit", count: 186, share: 0 },
    { name: "video_play", count: 980, share: 2 },
  ],
  topDevices: [
    { name: "mobile", sessions: 6840, share: 55 },
    { name: "desktop", sessions: 4980, share: 40 },
    { name: "tablet", sessions: 630, share: 5 },
  ],
  topCountries: [
    { name: "Brazil", users: 5240, share: 62 },
    { name: "Portugal", users: 1420, share: 17 },
    { name: "United States", users: 980, share: 12 },
    { name: "Angola", users: 420, share: 5 },
  ],
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveMetrics(input: GoogleAnalyticsExecutiveInput): GoogleAnalyticsMetrics {
  return input.metrics ?? MOCK_METRICS;
}

function calculateTrafficScore(metrics: GoogleAnalyticsMetrics): number {
  let score = 35;
  score += Math.min(25, (metrics.sessions / 20000) * 100 * 0.25);
  score += Math.min(20, (metrics.pageViews / 50000) * 100 * 0.2);
  if (metrics.trafficTrend === "up") score += Math.min(15, metrics.trafficTrendPercent * 0.5);
  if (metrics.trafficTrend === "down") score -= Math.min(15, metrics.trafficTrendPercent * 0.5);
  score -= Math.min(15, metrics.bounceRate * 0.15);
  return clampScore(score);
}

function calculateEngagementScore(metrics: GoogleAnalyticsMetrics): number {
  let score = 40;
  score += Math.min(30, metrics.engagementRate * 0.3);
  score += Math.min(15, (metrics.avgSessionDuration / 300) * 100 * 0.15);
  score += Math.min(15, (metrics.engagedSessions / metrics.sessions) * 100 * 0.15);
  return clampScore(score);
}

function calculateConversionScore(
  metrics: GoogleAnalyticsMetrics,
  input: GoogleAnalyticsExecutiveInput,
): number {
  let score = 35;
  score += Math.min(30, metrics.conversionRate * 8);
  score += Math.min(20, (metrics.conversions / 300) * 100 * 0.2);
  score += Math.min(10, (input.marketingExecutive?.conversionScore ?? 0) * 0.1);
  return clampScore(score);
}

function calculateAudienceScore(metrics: GoogleAnalyticsMetrics): number {
  let score = 40;
  score += Math.min(25, (metrics.users / 15000) * 100 * 0.25);
  score += Math.min(20, (metrics.newUsers / metrics.totalUsers) * 100 * 0.2);
  score += Math.min(15, metrics.realtimeUsers * 2);
  return clampScore(score);
}

function calculateContentScore(metrics: GoogleAnalyticsMetrics): number {
  const topPageShare = metrics.topPages[0]?.share ?? 0;
  let score = 45;
  score += Math.min(20, metrics.topPages.length * 4);
  score += topPageShare > 40 ? 10 : topPageShare > 25 ? 5 : 0;
  score += Math.min(15, metrics.topEvents.length * 3);
  return clampScore(score);
}

function buildRisks(metrics: GoogleAnalyticsMetrics): GoogleAnalyticsInsightItem[] {
  const risks: GoogleAnalyticsInsightItem[] = [];
  let index = 0;

  if (metrics.bounceRate > 55) {
    risks.push({
      id: `risk-${index++}`,
      title: "Taxa de rejeição elevada",
      description: `Bounce rate em ${metrics.bounceRate}% — revisar landing pages e velocidade.`,
      severity: metrics.bounceRate > 70 ? "critical" : "high",
    });
  }

  if (metrics.trafficTrend === "down" && metrics.trafficTrendPercent >= 10) {
    risks.push({
      id: `risk-${index++}`,
      title: "Queda de tráfego",
      description: `Sessões em queda de ${metrics.trafficTrendPercent}% vs período anterior.`,
      severity: metrics.trafficTrendPercent >= 20 ? "critical" : "high",
    });
  }

  if (metrics.conversionRate < 1) {
    risks.push({
      id: `risk-${index++}`,
      title: "Conversão abaixo do benchmark",
      description: `Taxa de conversão em ${metrics.conversionRate}% — otimizar funil e CTAs.`,
      severity: metrics.conversionRate < 0.5 ? "high" : "medium",
    });
  }

  const paidShare =
    metrics.topChannels.find((channel) => /paid|cpc|ppc/i.test(channel.name))?.share ?? 0;
  if (paidShare > 50) {
    risks.push({
      id: `risk-${index++}`,
      title: "Dependência de mídia paga",
      description: `${paidShare}% do tráfego via canais pagos — diversificar aquisição.`,
      severity: "medium",
    });
  }

  return risks.slice(0, 5);
}

function buildOpportunities(
  metrics: GoogleAnalyticsMetrics,
  input: GoogleAnalyticsExecutiveInput,
): GoogleAnalyticsInsightItem[] {
  const opportunities: GoogleAnalyticsInsightItem[] = [];
  let index = 0;

  const organic = metrics.topChannels.find((channel) => /organic/i.test(channel.name));
  if (organic && organic.share >= 25) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "SEO orgânico forte",
      description: `${organic.name} com ${organic.share}% das sessões — ampliar conteúdo de topo de funil.`,
      severity: "high",
    });
  }

  if (metrics.trafficTrend === "up") {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Momentum de tráfego",
      description: `Crescimento de ${metrics.trafficTrendPercent}% — escalar campanhas nos canais vencedores.`,
      severity: "high",
    });
  }

  if (metrics.topEvents.some((event) => /form|submit|lead/i.test(event.name))) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Eventos de conversão ativos",
      description: "Eventos de formulário detectados — implementar remarketing e nurturing.",
      severity: "medium",
    });
  }

  for (const opp of input.intelligence?.opportunities.slice(0, 1) ?? []) {
    if (/tráfego|traffic|analytics|conversão|seo|conteúdo/i.test(opp)) {
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
  risks: GoogleAnalyticsInsightItem[],
  opportunities: GoogleAnalyticsInsightItem[],
  metrics: GoogleAnalyticsMetrics,
  input: GoogleAnalyticsExecutiveInput,
): GoogleAnalyticsRecommendation[] {
  const recs: GoogleAnalyticsRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  if (metrics.topPages.length > 0) {
    const topPage = metrics.topPages[0];
    recs.push({
      id: `rec-${index++}`,
      title: `Otimizar página líder: ${topPage.path}`,
      description: `${topPage.views.toLocaleString("pt-BR")} visualizações (${topPage.share}%) — testar CTAs e prova social.`,
      priority: "high",
    });
  }

  for (const action of input.strategy?.marketingStrategy.actions.slice(0, 1) ?? []) {
    if (/analytics|tráfego|traffic|conversão|seo|conteúdo/i.test(action)) {
      recs.push({
        id: `rec-${index++}`,
        title: action.split(/[.—]/)[0]?.trim() ?? "Ação de analytics",
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
      title: "Monitorar funil GA4 semanalmente",
      description: "Revisar canais, páginas e eventos de conversão com cadência executiva.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  trafficScore: number,
  metrics: GoogleAnalyticsMetrics,
): string {
  const trendLabel =
    metrics.trafficTrend === "up"
      ? `alta ${metrics.trafficTrendPercent}%`
      : metrics.trafficTrend === "down"
        ? `queda ${metrics.trafficTrendPercent}%`
        : "estável";

  return `${companyName} — Google Analytics 4 com saúde ${healthScore}/100. Tráfego ${trafficScore}/100 · ${metrics.users.toLocaleString("pt-BR")} usuários · ${metrics.sessions.toLocaleString("pt-BR")} sessões · conversão ${metrics.conversionRate}% · tendência ${trendLabel}. Inteligência web integrada ao CEO Digital Samuel AI™.`;
}

export function buildGoogleAnalyticsExecutive(
  input: GoogleAnalyticsExecutiveInput = {},
): GoogleAnalyticsExecutive {
  const metrics = resolveMetrics(input);
  const companyName = input.companyName ?? "Empresa";

  const trafficScore = calculateTrafficScore(metrics);
  const engagementScore = calculateEngagementScore(metrics);
  const conversionScore = calculateConversionScore(metrics, input);
  const audienceScore = calculateAudienceScore(metrics);
  const contentScore = calculateContentScore(metrics);

  const googleAnalyticsRisks = buildRisks(metrics);
  const googleAnalyticsOpportunities = buildOpportunities(metrics, input);
  const googleAnalyticsRecommendations = buildRecommendations(
    googleAnalyticsRisks,
    googleAnalyticsOpportunities,
    metrics,
    input,
  );

  const googleAnalyticsHealthScore = clampScore(
    (trafficScore + engagementScore + conversionScore + audienceScore + contentScore) / 5,
  );

  return {
    googleAnalyticsHealthScore,
    trafficScore,
    engagementScore,
    conversionScore,
    audienceScore,
    contentScore,
    users: metrics.users,
    sessions: metrics.sessions,
    conversions: metrics.conversions,
    conversionRate: metrics.conversionRate,
    pageViews: metrics.pageViews,
    bounceRate: metrics.bounceRate,
    engagementRate: metrics.engagementRate,
    realtimeUsers: metrics.realtimeUsers,
    trafficTrend: metrics.trafficTrend,
    trafficTrendPercent: metrics.trafficTrendPercent,
    topChannels: metrics.topChannels,
    topPages: metrics.topPages,
    topEvents: metrics.topEvents,
    googleAnalyticsRisks,
    googleAnalyticsOpportunities,
    googleAnalyticsRecommendations,
    googleAnalyticsExecutiveSummary: buildSummary(
      companyName,
      googleAnalyticsHealthScore,
      trafficScore,
      metrics,
    ),
  };
}
