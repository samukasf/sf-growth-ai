import { supabase } from "@/lib/supabase/client";

import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";
import type { ExecutiveForecast } from "@/features/samuel-ai/services/executive-forecast.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";

export type MarketingCampaignRecord = {
  id: string;
  company_id: string;
  name: string;
  platform: string;
  objective: string | null;
  status: string | null;
  budget: number | null;
  spent: number | null;
  revenue_generated: number | null;
  roi: number | null;
};

export type MarketingChannel = {
  id: string;
  name: string;
  score: number;
  metric: string;
};

export type CampaignPerformance = {
  id: string;
  name: string;
  platform: string;
  roi: number;
  status: string;
  spent: number;
  revenue: number;
};

export type MarketingInsightItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
};

export type MarketingRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type MarketingExecutive = {
  marketingHealthScore: number;
  brandScore: number;
  seoScore: number;
  socialScore: number;
  trafficScore: number;
  contentScore: number;
  paidMediaScore: number;
  conversionScore: number;
  audienceGrowth: string;
  campaignPerformance: CampaignPerformance[];
  topChannels: MarketingChannel[];
  weakChannels: MarketingChannel[];
  marketingRisks: MarketingInsightItem[];
  marketingOpportunities: MarketingInsightItem[];
  marketingRecommendations: MarketingRecommendation[];
  marketingExecutiveSummary: string;
};

export type MarketingExecutiveInput = {
  campaigns?: MarketingCampaignRecord[];
  marketingScore?: number | null;
  companyName?: string;
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  crmExecutive?: CrmExecutive | null;
};

const MOCK_CAMPAIGNS: MarketingCampaignRecord[] = [
  {
    id: "mkt-1",
    company_id: "mock",
    name: "Lançamento Q2 — LinkedIn Ads",
    platform: "LinkedIn",
    objective: "Leads B2B",
    status: "active",
    budget: 12000,
    spent: 8400,
    revenue_generated: 32000,
    roi: 280,
  },
  {
    id: "mkt-2",
    company_id: "mock",
    name: "SEO — Conteúdo Executivo",
    platform: "Organic",
    objective: "Tráfego qualificado",
    status: "active",
    budget: 5000,
    spent: 3200,
    revenue_generated: 18500,
    roi: 478,
  },
  {
    id: "mkt-3",
    company_id: "mock",
    name: "Instagram — Autoridade de Marca",
    platform: "Instagram",
    objective: "Engajamento",
    status: "active",
    budget: 6000,
    spent: 5100,
    revenue_generated: 9200,
    roi: 80,
  },
  {
    id: "mkt-4",
    company_id: "mock",
    name: "Google Ads — Captação",
    platform: "Google",
    objective: "Conversão",
    status: "paused",
    budget: 8000,
    spent: 7800,
    revenue_generated: 6400,
    roi: -18,
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveCampaigns(input: MarketingExecutiveInput): MarketingCampaignRecord[] {
  const campaigns = input.campaigns ?? [];
  return campaigns.length > 0 ? campaigns : MOCK_CAMPAIGNS;
}

function platformScore(campaigns: MarketingCampaignRecord[], platform: string): number {
  const filtered = campaigns.filter(
    (c) => c.platform.toLowerCase().includes(platform.toLowerCase()),
  );
  if (filtered.length === 0) return 55;

  const avgRoi =
    filtered.reduce((sum, c) => sum + Number(c.roi ?? 0), 0) / filtered.length;
  return clampScore(50 + avgRoi * 0.15);
}

function buildChannelScores(campaigns: MarketingCampaignRecord[]): MarketingChannel[] {
  const platforms = [...new Set(campaigns.map((c) => c.platform))];

  return platforms.map((platform, index) => {
    const platformCampaigns = campaigns.filter((c) => c.platform === platform);
    const totalSpent = platformCampaigns.reduce((s, c) => s + Number(c.spent ?? 0), 0);
    const totalRevenue = platformCampaigns.reduce(
      (s, c) => s + Number(c.revenue_generated ?? 0),
      0,
    );
    const avgRoi =
      platformCampaigns.reduce((s, c) => s + Number(c.roi ?? 0), 0) /
      Math.max(1, platformCampaigns.length);

    return {
      id: `channel-${index + 1}`,
      name: platform,
      score: clampScore(50 + avgRoi * 0.12),
      metric: `ROI ${Math.round(avgRoi)}% · ${formatCurrency(totalRevenue)} / ${formatCurrency(totalSpent)}`,
    };
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildCampaignPerformance(
  campaigns: MarketingCampaignRecord[],
): CampaignPerformance[] {
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    platform: c.platform,
    roi: Number(c.roi ?? 0),
    status: c.status ?? "draft",
    spent: Number(c.spent ?? 0),
    revenue: Number(c.revenue_generated ?? 0),
  }));
}

function calculateScores(
  input: MarketingExecutiveInput,
  campaigns: MarketingCampaignRecord[],
  channels: MarketingChannel[],
): {
  brandScore: number;
  seoScore: number;
  socialScore: number;
  trafficScore: number;
  contentScore: number;
  paidMediaScore: number;
  conversionScore: number;
} {
  const baseMarketing = input.marketingScore ?? input.strategy?.confidenceScore ?? 55;

  const brandScore = clampScore(
    baseMarketing * 0.4 +
      (input.intelligence?.strengths.length ?? 0) * 6 +
      (input.strategy?.differentiation.length ?? 0) * 5,
  );

  const seoScore = clampScore(
    platformScore(campaigns, "organic") +
      (input.competitor?.opportunities.some((o) =>
        o.title.toLowerCase().includes("seo"),
      )
        ? 8
        : 0),
  );

  const socialScore = clampScore(
    (platformScore(campaigns, "instagram") +
      platformScore(campaigns, "linkedin") +
      platformScore(campaigns, "facebook")) /
      3,
  );

  const trafficScore = clampScore(
    45 +
      campaigns.filter((c) => c.status === "active").length * 8 +
      (input.forecast?.predictions.leads ? 10 : 0),
  );

  const contentScore = clampScore(
    40 +
      (input.intelligence?.strengths.filter((s) =>
        s.toLowerCase().includes("conteúdo") || s.toLowerCase().includes("conteudo"),
      ).length ?? 0) *
        10 +
      platformScore(campaigns, "organic") * 0.3,
  );

  const paidPlatforms = channels.filter(
    (c) =>
      !c.name.toLowerCase().includes("organic") &&
      !c.name.toLowerCase().includes("seo"),
  );
  const paidMediaScore =
    paidPlatforms.length > 0
      ? clampScore(
          paidPlatforms.reduce((s, c) => s + c.score, 0) / paidPlatforms.length,
        )
      : clampScore(platformScore(campaigns, "google"));

  const conversionScore = clampScore(
    input.crmExecutive?.conversionRate ??
      50 + campaigns.filter((c) => Number(c.roi ?? 0) > 100).length * 8,
  );

  return {
    brandScore,
    seoScore,
    socialScore,
    trafficScore,
    contentScore,
    paidMediaScore,
    conversionScore,
  };
}

function calculateMarketingHealthScore(scores: {
  brandScore: number;
  seoScore: number;
  socialScore: number;
  trafficScore: number;
  contentScore: number;
  paidMediaScore: number;
  conversionScore: number;
}): number {
  const avg =
    (scores.brandScore +
      scores.seoScore +
      scores.socialScore +
      scores.trafficScore +
      scores.contentScore +
      scores.paidMediaScore +
      scores.conversionScore) /
    7;

  return clampScore(avg);
}

function buildAudienceGrowth(input: MarketingExecutiveInput): string {
  const growth = input.forecast?.expectedGrowth ?? "+12%";
  const leads = input.forecast?.predictions.leads ?? "186 / trimestre";
  return `Crescimento esperado ${growth} · Leads projetados: ${leads}`;
}

function buildMarketingRisks(
  campaigns: CampaignPerformance[],
  conversionScore: number,
  paidMediaScore: number,
): MarketingInsightItem[] {
  const risks: MarketingInsightItem[] = [];
  let index = 0;

  const negativeRoi = campaigns.filter((c) => c.roi < 0);
  if (negativeRoi.length > 0) {
    risks.push({
      id: `risk-${index++}`,
      title: "Campanhas com ROI negativo",
      description: `${negativeRoi.length} campanha(s) abaixo do breakeven — revisar segmentação e criativos.`,
      severity: "high",
    });
  }

  if (conversionScore < 40) {
    risks.push({
      id: `risk-${index++}`,
      title: "Conversão abaixo do ideal",
      description: `Score de conversão ${conversionScore}/100 — funil de marketing precisa de otimização.`,
      severity: conversionScore < 25 ? "critical" : "high",
    });
  }

  if (paidMediaScore < 45) {
    risks.push({
      id: `risk-${index++}`,
      title: "Mídia paga ineficiente",
      description: `Paid Media Score ${paidMediaScore}/100 — realocar budget para canais de melhor performance.`,
      severity: "medium",
    });
  }

  const paused = campaigns.filter((c) => c.status === "paused");
  if (paused.length >= 2) {
    risks.push({
      id: `risk-${index++}`,
      title: "Campanhas pausadas",
      description: `${paused.length} campanha(s) pausada(s) — possível perda de momentum de marca.`,
      severity: "medium",
    });
  }

  return risks;
}

function buildMarketingOpportunities(
  topChannels: MarketingChannel[],
  input: MarketingExecutiveInput,
): MarketingInsightItem[] {
  const opportunities: MarketingInsightItem[] = [];
  let index = 0;

  for (const channel of topChannels.slice(0, 2)) {
    opportunities.push({
      id: `opp-${index++}`,
      title: `Escalar canal: ${channel.name}`,
      description: `${channel.metric} — candidato a expansão de budget.`,
      severity: "high",
    });
  }

  for (const opp of input.competitor?.opportunities.slice(0, 1) ?? []) {
    opportunities.push({
      id: `opp-${index++}`,
      title: opp.title,
      description: opp.description,
      severity: "medium",
    });
  }

  if ((input.intelligence?.opportunities.length ?? 0) > 0) {
    opportunities.push({
      id: `opp-${index++}`,
      title: "Oportunidade de posicionamento",
      description: input.intelligence!.opportunities[0] ?? "",
      severity: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function buildMarketingRecommendations(
  risks: MarketingInsightItem[],
  opportunities: MarketingInsightItem[],
  weakChannels: MarketingChannel[],
  input: MarketingExecutiveInput,
): MarketingRecommendation[] {
  const recs: MarketingRecommendation[] = [];
  let index = 0;

  for (const risk of risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 2)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Mitigar: ${risk.title}`,
      description: risk.description,
      priority: risk.severity === "critical" ? "critical" : "high",
    });
  }

  for (const channel of weakChannels.slice(0, 1)) {
    recs.push({
      id: `rec-${index++}`,
      title: `Otimizar canal: ${channel.name}`,
      description: `Score ${channel.score}/100 — revisar criativos, segmentação e landing pages.`,
      priority: "high",
    });
  }

  for (const action of input.strategy?.marketingStrategy.actions.slice(0, 1) ?? []) {
    recs.push({
      id: `rec-${index++}`,
      title: action.split(/[.—]/)[0]?.trim() ?? "Ação de marketing",
      description: action,
      priority: "medium",
    });
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
      title: "Manter cadência de marketing",
      description: "Continuar monitoramento de campanhas e otimização semanal de canais.",
      priority: "medium",
    });
  }

  return recs.slice(0, 6);
}

function buildSummary(
  companyName: string,
  healthScore: number,
  conversionScore: number,
  topChannel: string | null,
): string {
  return `${companyName} — Marketing executivo com saúde ${healthScore}/100. Conversão ${conversionScore}/100${topChannel ? ` · Melhor canal: ${topChannel}` : ""}. Inteligência de marketing integrada ao CEO Digital Samuel AI™.`;
}

export function buildMarketingExecutive(
  input: MarketingExecutiveInput = {},
): MarketingExecutive {
  const campaigns = resolveCampaigns(input);
  const campaignPerformance = buildCampaignPerformance(campaigns);
  const channels = buildChannelScores(campaigns);
  const sortedChannels = [...channels].sort((a, b) => b.score - a.score);

  const scores = calculateScores(input, campaigns, channels);
  const marketingHealthScore = calculateMarketingHealthScore(scores);

  const topChannels = sortedChannels.slice(0, 3);
  const weakChannels = [...sortedChannels].reverse().slice(0, 3);

  const marketingRisks = buildMarketingRisks(
    campaignPerformance,
    scores.conversionScore,
    scores.paidMediaScore,
  );
  const marketingOpportunities = buildMarketingOpportunities(topChannels, input);
  const marketingRecommendations = buildMarketingRecommendations(
    marketingRisks,
    marketingOpportunities,
    weakChannels,
    input,
  );

  return {
    marketingHealthScore,
    ...scores,
    audienceGrowth: buildAudienceGrowth(input),
    campaignPerformance,
    topChannels,
    weakChannels,
    marketingRisks,
    marketingOpportunities,
    marketingRecommendations,
    marketingExecutiveSummary: buildSummary(
      input.companyName ?? "Empresa",
      marketingHealthScore,
      scores.conversionScore,
      topChannels[0]?.name ?? null,
    ),
  };
}

export async function fetchMarketingExecutiveInput(
  companyId: string,
  companyName?: string,
): Promise<MarketingExecutiveInput> {
  const [campaignsResult, growthResult] = await Promise.all([
    supabase
      .from("marketing_campaigns")
      .select(
        "id, company_id, name, platform, objective, status, budget, spent, revenue_generated, roi",
      )
      .eq("company_id", companyId),
    supabase
      .from("growth_reports")
      .select("marketing_score")
      .eq("company_id", companyId)
      .order("report_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (campaignsResult.error) throw campaignsResult.error;
  if (growthResult.error) throw growthResult.error;

  return {
    campaigns: (campaignsResult.data ?? []) as MarketingCampaignRecord[],
    marketingScore: growthResult.data?.marketing_score
      ? Number(growthResult.data.marketing_score)
      : null,
    companyName,
  };
}

export async function buildMarketingExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: Omit<MarketingExecutiveInput, "campaigns" | "marketingScore" | "companyName"> = {},
): Promise<MarketingExecutive> {
  const base = await fetchMarketingExecutiveInput(companyId, companyName);
  return buildMarketingExecutive({ ...base, ...engines });
}
