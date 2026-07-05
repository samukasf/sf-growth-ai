import type { ExecutiveContext } from "@/services/executive-context.service";

import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import type { GoogleAnalyticsExecutive } from "@/features/google-analytics/services/google-analytics-executive.service";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import type { LinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";
import type { WatcherExecutive } from "@/features/watchers/types/watcher.types";
import type { MarketWatcherResult } from "@/features/watchers/market/market-watcher.types";
import type { SeoWatcherResult } from "@/features/watchers/seo/seo-watcher.types";

import type { ExecutiveAction } from "./executive-action.service";
import type { ExecutiveCompetitor } from "./executive-competitor.service";
import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutionPlan } from "./executive-execution-planner.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveLearning } from "./executive-learning.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";
import type { ExecutivePriority } from "./executive-priority.service";
import type { ExecutiveRecommendation } from "./executive-recommendation.service";
import type { ExecutiveStrategy } from "./executive-strategy.service";

export type CompanyHealthStatus = "excellent" | "good" | "fair" | "critical";

export type CompanyHealth = {
  score: number;
  status: CompanyHealthStatus;
  summary: string;
};

export type ExecutiveCEO = {
  executiveSummary: string;
  companyHealth: CompanyHealth;
  executiveScore: number;
  growthScore: number;
  riskScore: number;
  opportunityScore: number;
  executiveDecision: string;
  executiveRecommendation: string;
  topPriorities: string[];
  nextActions: string[];
  ceoMessage: string;
};

export type ExecutiveCEOInput = {
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  monitoring?: ExecutiveMonitoring | null;
  learning?: ExecutiveLearning | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  strategy?: ExecutiveStrategy | null;
  action?: ExecutiveAction | null;
  priority?: ExecutivePriority | null;
  recommendation?: ExecutiveRecommendation | null;
  crmExecutive?: CrmExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
  salesExecutive?: SalesExecutive | null;
  financeExecutive?: FinanceExecutive | null;
  operationsExecutive?: OperationsExecutive | null;
  hrExecutive?: HrExecutive | null;
  legalExecutive?: LegalExecutive | null;
  googleBusinessExecutive?: GoogleBusinessExecutive | null;
  googleAnalyticsExecutive?: GoogleAnalyticsExecutive | null;
  searchConsoleExecutive?: SearchConsoleExecutive | null;
  metaExecutive?: MetaExecutive | null;
  linkedInExecutive?: LinkedInExecutive | null;
  watcherExecutive?: WatcherExecutive | null;
  marketWatcher?: MarketWatcherResult | null;
  seoWatcher?: SeoWatcherResult | null;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function healthStatus(score: number): CompanyHealthStatus {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "critical";
}

function healthLabel(status: CompanyHealthStatus): string {
  switch (status) {
    case "excellent":
      return "Excelente";
    case "good":
      return "Boa";
    case "fair":
      return "Atenção";
    default:
      return "Crítica";
  }
}

function calculateCompanyHealthScore(input: ExecutiveCEOInput): number {
  let score = 40;

  if (input.context) score += 10;
  score += Math.min(10, (input.context?.memories.length ?? 0) * 2);

  const progress = input.monitoring?.progress.overall ?? 0;
  score += Math.min(20, progress * 0.2);

  score -= Math.min(20, (input.monitoring?.progress.delayRisk ?? 0) * 0.2);

  const criticalKpis =
    input.monitoring?.kpis.filter((k) => k.status === "critical").length ?? 0;
  score -= Math.min(15, criticalKpis * 5);

  const onTrackKpis =
    input.monitoring?.kpis.filter((k) => k.status === "on_track" || k.status === "achieved").length ?? 0;
  score += Math.min(15, onTrackKpis * 3);

  if ((input.executionPlans?.length ?? 0) > 0) score += 8;

  if (input.crmExecutive) {
    score += Math.min(12, input.crmExecutive.crmHealthScore * 0.12);
    score -= Math.min(8, input.crmExecutive.inactiveContacts * 2);
  }

  if (input.marketingExecutive) {
    score += Math.min(10, input.marketingExecutive.marketingHealthScore * 0.1);
    score -= Math.min(
      6,
      input.marketingExecutive.marketingRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.salesExecutive) {
    score += Math.min(10, input.salesExecutive.salesHealthScore * 0.1);
    score -= Math.min(
      6,
      input.salesExecutive.salesRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.financeExecutive) {
    score += Math.min(10, input.financeExecutive.financeHealthScore * 0.1);
    score -= Math.min(
      6,
      input.financeExecutive.financialRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.operationsExecutive) {
    score += Math.min(10, input.operationsExecutive.operationsHealthScore * 0.1);
    score -= Math.min(
      6,
      input.operationsExecutive.operationalRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.hrExecutive) {
    score += Math.min(10, input.hrExecutive.hrHealthScore * 0.1);
    score -= Math.min(
      6,
      input.hrExecutive.retentionRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.legalExecutive) {
    score += Math.min(10, input.legalExecutive.legalHealthScore * 0.1);
    score -= Math.min(
      6,
      input.legalExecutive.lgpdGdprRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.googleBusinessExecutive) {
    score += Math.min(10, input.googleBusinessExecutive.googleBusinessHealthScore * 0.1);
    score -= Math.min(
      6,
      input.googleBusinessExecutive.googleBusinessRisks.filter((r) => r.severity === "critical")
        .length * 3,
    );
  }

  if (input.googleAnalyticsExecutive) {
    score += Math.min(10, input.googleAnalyticsExecutive.googleAnalyticsHealthScore * 0.1);
    score -= Math.min(
      6,
      input.googleAnalyticsExecutive.googleAnalyticsRisks.filter((r) => r.severity === "critical")
        .length * 3,
    );
  }

  if (input.searchConsoleExecutive) {
    score += Math.min(10, input.searchConsoleExecutive.seoHealthScore * 0.1);
    score -= Math.min(
      6,
      input.searchConsoleExecutive.searchConsoleRisks.filter((r) => r.severity === "critical")
        .length * 3,
    );
  }

  if (input.metaExecutive) {
    score += Math.min(10, input.metaExecutive.metaHealthScore * 0.1);
    score -= Math.min(
      6,
      input.metaExecutive.metaRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.linkedInExecutive) {
    score += Math.min(10, input.linkedInExecutive.linkedInHealthScore * 0.1);
    score -= Math.min(
      6,
      input.linkedInExecutive.linkedInRisks.filter((r) => r.severity === "critical").length * 3,
    );
  }

  if (input.watcherExecutive) {
    score += Math.min(8, input.watcherExecutive.summary.activeWatchers * 2);
    score -= Math.min(12, input.watcherExecutive.summary.criticalAlerts * 4);
  }

  if (input.marketWatcher) {
    score -= Math.min(
      8,
      input.marketWatcher.threats.filter((threat) => threat.severity === "Critical").length * 4,
    );
    score += Math.min(6, input.marketWatcher.opportunities.length * 2);
  }

  if (input.seoWatcher) {
    score -= Math.min(
      8,
      input.seoWatcher.risks.filter((risk) => risk.severity === "Critical" || risk.severity === "High").length * 3,
    );
    score += Math.min(6, input.seoWatcher.opportunities.length * 2);
  }

  return clampScore(score);
}

function calculateExecutiveScore(input: ExecutiveCEOInput): number {
  const parts = [
    input.strategy?.executiveScore,
    input.strategy?.confidenceScore,
    input.learning?.evolutionScore,
    input.priority?.priorityScore,
    input.recommendation?.confidenceLevel,
    input.monitoring?.progress.overall,
  ].filter((v): v is number => typeof v === "number");

  if (parts.length === 0) return 45;
  return clampScore(parts.reduce((sum, v) => sum + v, 0) / parts.length);
}

function calculateGrowthScore(input: ExecutiveCEOInput): number {
  let score = 30;

  score += Math.min(25, (input.forecast?.successProbability ?? 0) * 0.25);
  score += Math.min(15, (input.intelligence?.opportunities.length ?? 0) * 4);
  score += Math.min(10, (input.competitor?.opportunities.length ?? 0) * 3);
  score += Math.min(10, (input.learning?.evolutionScore ?? 0) * 0.1);
  score += Math.min(10, (input.strategy?.executiveScore ?? 0) * 0.1);

  if (input.crmExecutive) {
    score += Math.min(12, input.crmExecutive.conversionRate * 0.12);
    score += Math.min(8, input.crmExecutive.activeLeads * 2);
    if (input.crmExecutive.pipelineValue > 0) score += 8;
  }

  if (input.marketingExecutive) {
    score += Math.min(10, input.marketingExecutive.conversionScore * 0.1);
    score += Math.min(8, input.marketingExecutive.topChannels.length * 3);
  }

  if (input.salesExecutive) {
    score += Math.min(10, input.salesExecutive.winRate * 0.1);
    score += Math.min(8, input.salesExecutive.openOpportunities.length * 3);
    if (input.salesExecutive.salesPipelineScore >= 60) score += 6;
  }

  if (input.financeExecutive) {
    score += Math.min(10, input.financeExecutive.profitMargin * 0.1);
    if (input.financeExecutive.monthlyProfit > 0) score += 8;
    score += Math.min(6, input.financeExecutive.cashFlowScore * 0.06);
  }

  if (input.operationsExecutive) {
    score += Math.min(10, input.operationsExecutive.deliveryScore * 0.1);
    score += Math.min(8, input.operationsExecutive.productivityScore * 0.08);
    if (input.operationsExecutive.automationScore >= 50) score += 5;
  }

  if (input.hrExecutive) {
    score += Math.min(10, input.hrExecutive.engagementScore * 0.1);
    score += Math.min(8, input.hrExecutive.productivityScore * 0.08);
    if (input.hrExecutive.teamSize >= 3) score += 5;
  }

  if (input.legalExecutive) {
    score += Math.min(10, input.legalExecutive.complianceScore * 0.1);
    score += Math.min(8, input.legalExecutive.dataProtectionScore * 0.08);
    if (input.legalExecutive.contractRiskScore <= 30) score += 5;
  }

  if (input.googleBusinessExecutive) {
    score += Math.min(10, input.googleBusinessExecutive.visibilityScore * 0.1);
    score += Math.min(8, input.googleBusinessExecutive.reputationScore * 0.08);
    if (input.googleBusinessExecutive.averageRating >= 4.5) score += 5;
  }

  if (input.googleAnalyticsExecutive) {
    score += Math.min(10, input.googleAnalyticsExecutive.trafficScore * 0.1);
    score += Math.min(8, input.googleAnalyticsExecutive.conversionScore * 0.08);
    if (input.googleAnalyticsExecutive.trafficTrend === "up") score += 5;
  }

  if (input.searchConsoleExecutive) {
    score += Math.min(10, input.searchConsoleExecutive.organicTrafficScore * 0.1);
    score += Math.min(8, input.searchConsoleExecutive.ctrScore * 0.08);
    if (input.searchConsoleExecutive.averagePosition <= 10) score += 5;
  }

  if (input.metaExecutive) {
    score += Math.min(10, input.metaExecutive.engagementScore * 0.1);
    score += Math.min(8, input.metaExecutive.reachScore * 0.08);
    if (input.metaExecutive.roas >= 3) score += 5;
  }

  if (input.linkedInExecutive) {
    score += Math.min(10, input.linkedInExecutive.leadGenerationScore * 0.1);
    score += Math.min(8, input.linkedInExecutive.brandAuthorityScore * 0.08);
    if (input.linkedInExecutive.b2bOpportunityScore >= 60) score += 5;
  }

  return clampScore(score);
}

function calculateRiskScore(input: ExecutiveCEOInput): number {
  let score = 15;

  score += Math.min(25, (input.intelligence?.risks.length ?? 0) * 4);
  score += Math.min(20, (input.intelligence?.weaknesses.length ?? 0) * 3);
  score += Math.min(20, (input.monitoring?.progress.delayRisk ?? 0) * 0.2);
  score += Math.min(15, (input.monitoring?.alerts.filter((a) => a.severity === "critical").length ?? 0) * 5);
  score += Math.min(
    15,
    (input.competitor?.threats.filter((t) => t.severity === "critical" || t.severity === "high").length ?? 0) * 4,
  );

  if (input.priority?.riskLevel === "critical") score += 10;
  else if (input.priority?.riskLevel === "high") score += 6;

  if (input.marketWatcher) {
    score += Math.min(
      12,
      input.marketWatcher.threats.filter(
        (threat) => threat.severity === "Critical" || threat.severity === "High",
      ).length * 4,
    );
  }

  if (input.seoWatcher) {
    score += Math.min(
      10,
      input.seoWatcher.risks.filter(
        (risk) => risk.severity === "Critical" || risk.severity === "High",
      ).length * 3,
    );
  }

  return clampScore(score);
}

function calculateOpportunityScore(input: ExecutiveCEOInput): number {
  let score = 25;

  score += Math.min(20, (input.intelligence?.opportunities.length ?? 0) * 5);
  score += Math.min(15, (input.competitor?.marketGaps.length ?? 0) * 4);
  score += Math.min(15, (input.forecast?.recommendations.length ?? 0) * 3);
  score += Math.min(15, (input.action?.quickWins.length ?? 0) * 5);
  score += Math.min(10, (input.recommendation?.recommendedInvestments.length ?? 0) * 4);

  if (input.marketWatcher) {
    score += Math.min(12, input.marketWatcher.opportunities.length * 4);
  }

  if (input.seoWatcher) {
    score += Math.min(10, input.seoWatcher.opportunities.length * 3);
  }

  return clampScore(score);
}

function buildCompanyHealth(input: ExecutiveCEOInput, score: number): CompanyHealth {
  const status = healthStatus(score);
  const company = input.context?.company.name ?? "Empresa";
  const delayRisk = input.monitoring?.progress.delayRisk ?? 0;
  const memories = input.context?.memories.length ?? 0;

  return {
    score,
    status,
    summary: `${company} apresenta saúde ${healthLabel(status).toLowerCase()} (${score}/100). ${memories} memória(s) ativa(s) · Risco de atraso ${delayRisk}% · ${input.executionPlans?.length ?? 0} plano(s) de execução.`,
  };
}

function buildBiggestRisk(input: ExecutiveCEOInput): string {
  const criticalAlert = input.monitoring?.alerts.find(
    (alert) => alert.severity === "critical",
  );
  if (criticalAlert) {
    return `${criticalAlert.title}: ${criticalAlert.message}`;
  }

  const highAlert = input.monitoring?.alerts.find((alert) => alert.severity === "high");
  if (highAlert) {
    return `${highAlert.title}: ${highAlert.message}`;
  }

  if (input.intelligence?.risks[0]) {
    return input.intelligence.risks[0];
  }

  const forecastAlert = input.forecast?.futureAlerts[0];
  if (forecastAlert) {
    return forecastAlert;
  }

  const expectedScenario = input.forecast?.scenarios.find(
    (scenario) => scenario.type === "expected",
  );
  const scenarioRisk = expectedScenario?.risks[0];
  if (scenarioRisk) {
    return `${scenarioRisk.title}: ${scenarioRisk.description}`;
  }

  const delayRisk = input.monitoring?.progress.delayRisk ?? 0;
  if (delayRisk >= 50) {
    return `Risco de atraso operacional em ${delayRisk}% — execução abaixo do ritmo necessário.`;
  }

  if (input.intelligence?.weaknesses[0]) {
    return input.intelligence.weaknesses[0];
  }

  for (const bottleneck of input.monitoring?.bottlenecks.slice(0, 1) ?? []) {
    return bottleneck;
  }

  return "Nenhum risco crítico consolidado no ciclo atual.";
}

function buildBiggestOpportunity(input: ExecutiveCEOInput): string {
  if (input.intelligence?.opportunities[0]) {
    return input.intelligence.opportunities[0];
  }

  const expectedScenario = input.forecast?.scenarios.find(
    (scenario) => scenario.type === "expected",
  );
  const scenarioOpportunity = expectedScenario?.opportunities[0];
  if (scenarioOpportunity) {
    return `${scenarioOpportunity.title}: ${scenarioOpportunity.description}`;
  }

  const recommendedInvestment = input.recommendation?.recommendedInvestments[0];
  if (recommendedInvestment) {
    return `${recommendedInvestment.title}: ${recommendedInvestment.description}`;
  }

  const recommendedAction = input.recommendation?.recommendedActions[0];
  if (recommendedAction) {
    return `${recommendedAction.title}: ${recommendedAction.description}`;
  }

  if (input.intelligence?.strengths[0]) {
    return `Alavancar força identificada: ${input.intelligence.strengths[0]}`;
  }

  if (input.forecast?.recommendations[0]) {
    const recommendation = input.forecast.recommendations[0];
    return `${recommendation.title}: ${recommendation.description}`;
  }

  return "Consolidar contexto estratégico para mapear oportunidades de alto impacto.";
}

function parseContextObjectives(context: ExecutiveCEOInput["context"]): string | null {
  const objectives = context?.businessProfile?.objectives;
  if (!objectives) return null;

  if (Array.isArray(objectives)) {
    return objectives.find(Boolean) ?? null;
  }

  const first = objectives
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .find(Boolean);

  return first ?? null;
}

function buildStrategicFocus(input: ExecutiveCEOInput): string {
  if (input.strategy?.topPriorities[0]) {
    return input.strategy.topPriorities[0];
  }

  if (input.strategy?.strategicVision) {
    return input.strategy.strategicVision;
  }

  if (input.intelligence?.priorities[0]) {
    return input.intelligence.priorities[0];
  }

  if (input.strategy?.growthPlan30d.goals[0]) {
    return input.strategy.growthPlan30d.goals[0];
  }

  const objective = parseContextObjectives(input.context);
  if (objective) {
    return objective;
  }

  const positioning = input.context?.businessProfile?.positioning?.trim();
  if (positioning) {
    return positioning;
  }

  return "Estruturar base executiva e alinhar indicadores ao objetivo da empresa.";
}

function buildNextRecommendedAction(input: ExecutiveCEOInput): string {
  const topRecommendation = input.recommendation?.executiveRecommendations[0];
  if (topRecommendation) {
    return `${topRecommendation.title}: ${topRecommendation.description} (ROI: ${topRecommendation.estimatedROI})`;
  }

  const forecastRecommendation = input.forecast?.recommendations.find(
    (recommendation) =>
      recommendation.priority === "critical" || recommendation.priority === "high",
  );
  if (forecastRecommendation) {
    return `${forecastRecommendation.title}: ${forecastRecommendation.description}`;
  }

  const strategyAction = input.strategy?.growthPlan30d.actions[0];
  if (strategyAction) {
    return strategyAction;
  }

  if (input.recommendation?.executiveRecommendationSummary) {
    return input.recommendation.executiveRecommendationSummary;
  }

  return "Ativar ciclo de recomendações a partir da inteligência executiva consolidada.";
}

function buildExecutiveSummary(
  input: ExecutiveCEOInput,
  executiveScore: number,
  companyHealth: CompanyHealth,
): string {
  const company = input.context?.company.name ?? "A empresa";
  const parts: string[] = [];

  if (input.intelligence?.executiveSummary) {
    parts.push(input.intelligence.executiveSummary);
  } else if (input.context?.summary) {
    const summaryLine = input.context.summary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(". ");
    if (summaryLine) parts.push(summaryLine);
  }

  if (input.strategy?.executiveStrategy) {
    parts.push(input.strategy.executiveStrategy);
  }

  if (input.monitoring) {
    parts.push(
      `Execução em ${input.monitoring.progress.overall}% · ${input.monitoring.progress.overdueTasks} tarefa(s) atrasada(s) · risco de atraso ${input.monitoring.progress.delayRisk}%.`,
    );
  }

  if (input.forecast) {
    parts.push(
      `Crescimento projetado ${input.forecast.expectedGrowth} · probabilidade de sucesso ${input.forecast.successProbability}%.`,
    );
  }

  if (parts.length === 0) {
    return `${company} — análise executiva em consolidação. Conecte contexto e dados operacionais para ativar o CEO Digital.`;
  }

  return `${company} — CEO Digital Samuel AI™. ${parts.join(" ")} Score executivo ${executiveScore}/100 · Saúde ${companyHealth.score}/100.`;
}

function buildTopPriorities(input: ExecutiveCEOInput): string[] {
  const strategicFocus = buildStrategicFocus(input);
  const biggestOpportunity = buildBiggestOpportunity(input);

  const additionalPriorities = [
    ...(input.strategy?.topPriorities.slice(1) ?? []),
    ...(input.intelligence?.priorities ?? []),
    ...(input.recommendation?.executiveRecommendations
      .filter((recommendation) => recommendation.priority === "critical")
      .map((recommendation) => recommendation.title) ?? []),
    ...(input.forecast?.recommendations
      .filter((recommendation) => recommendation.priority === "critical")
      .map((recommendation) => recommendation.title) ?? []),
  ].filter(
    (priority) => priority !== strategicFocus && priority !== biggestOpportunity,
  );

  return [strategicFocus, biggestOpportunity, ...additionalPriorities]
    .filter(Boolean)
    .slice(0, 8);
}

function buildNextActions(input: ExecutiveCEOInput): string[] {
  return [
    ...(input.recommendation?.executiveRecommendations.slice(0, 3).map((item) => item.title) ??
      []),
    ...(input.forecast?.recommendations.slice(0, 2).map((item) => item.title) ?? []),
    ...(input.strategy?.growthPlan30d.actions.slice(0, 2) ?? []),
    ...(input.strategy?.growthPlan90d.actions.slice(0, 1) ?? []),
  ]
    .filter(Boolean)
    .slice(0, 6);
}

function buildCeoMessage(
  input: ExecutiveCEOInput,
  executiveScore: number,
  companyHealth: CompanyHealth,
  growthScore: number,
  riskScore: number,
): string {
  const company = input.context?.company.name ?? "sua empresa";
  const summary = buildExecutiveSummary(input, executiveScore, companyHealth);
  const biggestRisk = buildBiggestRisk(input);
  const biggestOpportunity = buildBiggestOpportunity(input);
  const strategicFocus = buildStrategicFocus(input);
  const nextAction = buildNextRecommendedAction(input);

  const tone =
    executiveScore >= 70
      ? "Estamos em posição forte para acelerar."
      : executiveScore >= 50
        ? "Temos base sólida, mas precisamos de foco imediato."
        : "Precisamos estabilizar fundamentos antes de escalar.";

  const growth = input.forecast?.expectedGrowth ?? "em consolidação";

  return `Olá, sou o CEO Digital da ${company}. ${tone} ${summary} Maior risco atual: ${biggestRisk} Maior oportunidade: ${biggestOpportunity} Foco estratégico: ${strategicFocus} Próxima ação recomendada: ${nextAction} Saúde operacional ${companyHealth.score}/100 · crescimento ${growthScore}/100 · risco consolidado ${riskScore}/100 · meta de crescimento ${growth}. Confio no motor executivo Samuel AI™ para converter estratégia em resultados mensuráveis.`;
}

export function buildExecutiveCEO(
  input: ExecutiveCEOInput = {},
): ExecutiveCEO | null {
  const hasData =
    input.context ||
    input.intelligence ||
    input.strategy ||
    input.action ||
    input.priority ||
    input.recommendation ||
    input.forecast ||
    input.monitoring ||
    input.learning ||
    input.competitor ||
    input.crmExecutive ||
    input.marketingExecutive ||
    input.salesExecutive ||
    input.financeExecutive ||
    input.operationsExecutive ||
    input.hrExecutive ||
    input.legalExecutive ||
    input.googleBusinessExecutive ||
    input.googleAnalyticsExecutive ||
    input.searchConsoleExecutive ||
    input.metaExecutive ||
    input.linkedInExecutive ||
    input.watcherExecutive ||
    input.marketWatcher ||
    input.seoWatcher ||
    (input.decisions?.length ?? 0) > 0;

  if (!hasData) return null;

  const companyHealthScore = calculateCompanyHealthScore(input);
  const companyHealth = buildCompanyHealth(input, companyHealthScore);
  const executiveScore = calculateExecutiveScore(input);
  const growthScore = calculateGrowthScore(input);
  const riskScore = calculateRiskScore(input);
  const opportunityScore = calculateOpportunityScore(input);

  return {
    executiveSummary: buildExecutiveSummary(input, executiveScore, companyHealth),
    companyHealth,
    executiveScore,
    growthScore,
    riskScore,
    opportunityScore,
    executiveDecision: buildBiggestRisk(input),
    executiveRecommendation: buildNextRecommendedAction(input),
    topPriorities: buildTopPriorities(input),
    nextActions: buildNextActions(input),
    ceoMessage: buildCeoMessage(
      input,
      executiveScore,
      companyHealth,
      growthScore,
      riskScore,
    ),
  };
}
