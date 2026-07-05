import type { ExecutiveForecast } from "../services/executive-forecast.service";

import {
  buildExecutiveSituation,
  type BuildExecutiveSituationInput,
} from "./executive-situation";
import type { ExecutiveBriefing, MetricTrend } from "./types";

export type BuildExecutiveBriefingInput = BuildExecutiveSituationInput;

function toMetricTrend(direction: string): MetricTrend {
  if (direction === "up") return "up";
  if (direction === "down") return "down";
  return "stable";
}

function formatMonthlyRevenue(annualRevenue: number | null | undefined): string {
  if (!annualRevenue || annualRevenue <= 0) return "—";
  const monthly = annualRevenue / 12;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(monthly);
}

function findForecastTrend(
  trends: ExecutiveForecast["trends"],
  metricName: string,
) {
  return trends.find((trend) =>
    trend.metric.toLowerCase().includes(metricName.toLowerCase()),
  );
}

function buildMetrics(input: BuildExecutiveBriefingInput): ExecutiveBriefing["metrics"] {
  const { context, forecast, monitoring } = input;

  if (forecast) {
    const revenueTrend = findForecastTrend(forecast.trends, "receita");
    const growthTrend = findForecastTrend(forecast.trends, "crescimento");
    const leadsTrend = findForecastTrend(forecast.trends, "leads");
    const conversionsTrend = findForecastTrend(forecast.trends, "convers");

    return {
      revenue: {
        label: "Receita",
        value: forecast.predictions.revenue,
        trend: revenueTrend ? toMetricTrend(revenueTrend.direction) : "stable",
        change: revenueTrend?.change ?? forecast.expectedGrowth,
      },
      growth: {
        label: "Crescimento",
        value: forecast.predictions.growth,
        trend: growthTrend ? toMetricTrend(growthTrend.direction) : "stable",
        change: growthTrend?.change ?? "projeção anual",
      },
      leads: {
        label: "Leads",
        value: forecast.predictions.leads,
        trend: leadsTrend ? toMetricTrend(leadsTrend.direction) : "stable",
        change: leadsTrend?.change ?? "projeção trimestral",
      },
      conversions: {
        label: "Conversões",
        value: forecast.predictions.conversions,
        trend: conversionsTrend ? toMetricTrend(conversionsTrend.direction) : "stable",
        change: conversionsTrend?.change ?? "projeção 90 dias",
      },
    };
  }

  const progress = monitoring?.progress.overall ?? 0;
  const delayRisk = monitoring?.progress.delayRisk ?? 0;
  const revenueValue = formatMonthlyRevenue(context?.company.annual_revenue);
  const progressTrend: MetricTrend =
    progress >= 60 ? "up" : progress < 30 ? "down" : "stable";

  return {
    revenue: {
      label: "Receita",
      value: revenueValue,
      trend: progressTrend,
      change: revenueValue === "—" ? "sem dado anual" : "base anual / 12",
    },
    growth: {
      label: "Crescimento",
      value: `${progress}%`,
      trend: progressTrend,
      change: "progresso de execução",
    },
    leads: {
      label: "Leads",
      value: monitoring ? `${monitoring.progress.pendingTasks} pendentes` : "—",
      trend: monitoring && monitoring.progress.overdueTasks > 0 ? "down" : "stable",
      change: monitoring
        ? `${monitoring.progress.completedTasks} concluídas`
        : "sem monitoramento",
    },
    conversions: {
      label: "Conversões",
      value: `${Math.max(0, 100 - delayRisk)}%`,
      trend: delayRisk >= 50 ? "down" : delayRisk <= 25 ? "up" : "stable",
      change: `risco de atraso ${delayRisk}%`,
    },
  };
}

function buildLast24hSummary(
  situation: ReturnType<typeof buildExecutiveSituation>,
  companyName: string,
): string {
  const parts = [
    situation.executiveSummary,
    ...situation.supportingEvidence.slice(0, 2),
  ].filter(Boolean);

  if (parts.length === 0) {
    return `Monitoramento ativo para ${companyName}. Consolidando contexto operacional para o próximo ciclo executivo.`;
  }

  return parts.slice(0, 3).join(" ");
}

function buildCampaignsText(input: BuildExecutiveBriefingInput): string {
  const { forecast, monitoring, intelligence } = input;

  if (forecast?.predictions.marketing) {
    return forecast.predictions.marketing;
  }

  const marketingIndicator = monitoring?.indicators.find((indicator) =>
    /campanha|marketing|mídia|anúncio/i.test(indicator),
  );
  if (marketingIndicator) return marketingIndicator;

  const marketingPriority = intelligence?.priorities.find((priority) =>
    /campanha|marketing|mídia|anúncio/i.test(priority),
  );
  if (marketingPriority) return marketingPriority;

  return "Nenhuma campanha ativa mapeada no período — priorizar ativação conforme fila executiva.";
}

function buildCompetitorsText(input: BuildExecutiveBriefingInput): string {
  const { intelligence } = input;
  const competitionSignal =
    intelligence?.risks.find((risk) => /concorr|mercado|share/i.test(risk)) ??
    intelligence?.weaknesses.find((weakness) => /concorr|mercado|share/i.test(weakness));

  if (competitionSignal) return competitionSignal;

  if ((intelligence?.risks.length ?? 0) > 0) {
    return intelligence!.risks[0];
  }

  return "Sem sinais críticos de concorrência nas últimas 24 horas.";
}

function buildMarketText(input: BuildExecutiveBriefingInput): string {
  const { context, forecast } = input;
  const segment =
    context?.businessProfile?.segment ??
    context?.company.industry ??
    "setor não informado";
  const growth = forecast?.expectedGrowth ?? "em consolidação";
  const alert = forecast?.futureAlerts[0];

  return alert
    ? `${segment} — crescimento projetado ${growth}. ${alert}`
    : `${segment} — crescimento projetado ${growth}.`;
}

function buildOpportunities(
  situation: ReturnType<typeof buildExecutiveSituation>,
  input: BuildExecutiveBriefingInput,
): string[] {
  const opportunities = [situation.principalOpportunity];

  for (const opportunity of input.intelligence?.opportunities ?? []) {
    opportunities.push(opportunity);
  }

  for (const scenario of input.forecast?.scenarios ?? []) {
    for (const opportunity of scenario.opportunities.slice(0, 1)) {
      opportunities.push(`${opportunity.title}: ${opportunity.description}`);
    }
  }

  if (opportunities.length <= 1) {
    for (const strength of input.intelligence?.strengths.slice(0, 3) ?? []) {
      opportunities.push(strength);
    }
  }

  return [...new Set(opportunities)].slice(0, 3);
}

export function buildExecutiveBriefing(
  input: BuildExecutiveBriefingInput = {},
): ExecutiveBriefing {
  const companyName = input.context?.company.name ?? "Sua empresa";
  const situation = buildExecutiveSituation(input);

  return {
    greeting: getTimeGreeting(),
    companyName,
    last24hSummary: buildLast24hSummary(situation, companyName),
    metrics: buildMetrics(input),
    campaigns: buildCampaignsText(input),
    competitors: buildCompetitorsText(input),
    market: buildMarketText(input),
    dayPriority: situation.currentPriority,
    currentRisk: situation.principalProblem,
    opportunities: buildOpportunities(situation, input),
    nextRecommendation: situation.recommendedExecution,
  };
}

export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatExecutiveDateTime(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days > 1 ? "s" : ""}`;
}
