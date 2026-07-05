import type { ExecutiveContext } from "@/services/executive-context.service";

import type { CrmExecutive } from "@/features/crm/services/crm-executive.service";
import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SalesExecutive } from "@/features/sales/services/sales-executive.service";
import type { FinanceExecutive } from "@/features/finance/services/finance-executive.service";
import type { OperationsExecutive } from "@/features/operations/services/operations-executive.service";
import type { HrExecutive } from "@/features/hr/services/hr-executive.service";
import type { LegalExecutive } from "@/features/legal/services/legal-executive.service";
import type { GoogleBusinessExecutive } from "@/features/google-business/services/google-business-executive.service";
import type { MetaExecutive } from "@/features/meta/services/meta-executive.service";
import type { LinkedInExecutive } from "@/features/linkedin/services/linkedin-executive.service";

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
  metaExecutive?: MetaExecutive | null;
  linkedInExecutive?: LinkedInExecutive | null;
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

  return clampScore(score);
}

function calculateOpportunityScore(input: ExecutiveCEOInput): number {
  let score = 25;

  score += Math.min(20, (input.intelligence?.opportunities.length ?? 0) * 5);
  score += Math.min(15, (input.competitor?.marketGaps.length ?? 0) * 4);
  score += Math.min(15, (input.forecast?.recommendations.length ?? 0) * 3);
  score += Math.min(15, (input.action?.quickWins.length ?? 0) * 5);
  score += Math.min(10, (input.recommendation?.recommendedInvestments.length ?? 0) * 4);

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

function buildExecutiveSummary(
  input: ExecutiveCEOInput,
  executiveScore: number,
  companyHealth: CompanyHealth,
): string {
  const company = input.context?.company.name ?? "A empresa";
  const intelligenceSummary =
    input.intelligence?.executiveSummary ??
    input.strategy?.executiveStrategy ??
    "Análise executiva em consolidação.";

  return `${company} — CEO Digital Samuel AI™. ${intelligenceSummary} Score executivo ${executiveScore}/100 · Saúde ${companyHealth.score}/100 · ${input.decisions?.length ?? 0} decisão(ões) · ${input.action?.executionOrder.length ?? 0} ação(ões) mapeada(s).${input.crmExecutive ? ` ${input.crmExecutive.crmExecutiveSummary}` : ""}${input.marketingExecutive ? ` ${input.marketingExecutive.marketingExecutiveSummary}` : ""}${input.salesExecutive ? ` ${input.salesExecutive.salesExecutiveSummary}` : ""}${input.financeExecutive ? ` ${input.financeExecutive.financeExecutiveSummary}` : ""}${input.operationsExecutive ? ` ${input.operationsExecutive.operationsExecutiveSummary}` : ""}${input.hrExecutive ? ` ${input.hrExecutive.hrExecutiveSummary}` : ""}${input.legalExecutive ? ` ${input.legalExecutive.legalExecutiveSummary}` : ""}${input.googleBusinessExecutive ? ` ${input.googleBusinessExecutive.googleBusinessExecutiveSummary}` : ""}${input.metaExecutive ? ` ${input.metaExecutive.metaExecutiveSummary}` : ""}${input.linkedInExecutive ? ` ${input.linkedInExecutive.linkedInExecutiveSummary}` : ""}`;
}

function buildTopDecision(input: ExecutiveCEOInput): string {
  const critical = input.decisions?.find((d) => d.priority === "Critical");
  if (critical) {
    return `${critical.title} — ${critical.description} (Prazo: ${critical.deadline})`;
  }

  const priorityTask = input.priority?.criticalTasks[0];
  if (priorityTask) {
    return `${priorityTask.title} — ${priorityTask.description}`;
  }

  return "Consolidar contexto executivo e ativar ciclo de decisões críticas.";
}

function buildTopRecommendation(input: ExecutiveCEOInput): string {
  const top = input.recommendation?.executiveRecommendations[0];
  if (top) {
    return `${top.title} — ${top.description} (ROI: ${top.estimatedROI})`;
  }

  return input.recommendation?.executiveRecommendationSummary ??
    "Ativar recomendações prioritárias derivadas da inteligência executiva.";
}

function buildTopPriorities(input: ExecutiveCEOInput): string[] {
  return [
    ...(input.strategy?.topPriorities ?? []),
    ...(input.priority?.top10Priorities.slice(0, 3).map((t) => t.title) ?? []),
    ...(input.recommendation?.executiveRecommendations
      .filter((r) => r.priority === "critical")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.crmExecutive?.crmRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.marketingExecutive?.marketingRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.salesExecutive?.salesRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.financeExecutive?.financialRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.operationsExecutive?.operationalRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.hrExecutive?.hrRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.legalExecutive?.legalRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.googleBusinessExecutive?.googleBusinessRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.metaExecutive?.metaRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
    ...(input.linkedInExecutive?.linkedInRecommendations
      .filter((r) => r.priority === "critical" || r.priority === "high")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
  ]
    .filter(Boolean)
    .slice(0, 8);
}

function buildNextActions(input: ExecutiveCEOInput): string[] {
  return [
    ...(input.action?.immediateActions.slice(0, 2).map((a) => a.title) ?? []),
    ...(input.priority?.top10Priorities.slice(0, 3).map((t) => t.title) ?? []),
    ...(input.action?.quickWins.slice(0, 2).map((a) => a.title) ?? []),
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
  const growth = input.forecast?.expectedGrowth ?? "+10%";
  const topAction = buildNextActions(input)[0] ?? "estruturar o ciclo executivo";

  const tone =
    executiveScore >= 70
      ? "Estamos em posição forte para acelerar."
      : executiveScore >= 50
        ? "Temos base sólida, mas precisamos de foco imediato."
        : "Precisamos estabilizar fundamentos antes de escalar.";

  const crmNote = input.crmExecutive
    ? ` CRM em ${input.crmExecutive.crmHealthScore}/100 com pipeline ativo e ${input.crmExecutive.activeLeads} leads.`
    : "";

  const marketingNote = input.marketingExecutive
    ? ` Marketing em ${input.marketingExecutive.marketingHealthScore}/100 com conversão ${input.marketingExecutive.conversionScore}/100.`
    : "";

  const salesNote = input.salesExecutive
    ? ` Vendas em ${input.salesExecutive.salesHealthScore}/100 com win rate ${input.salesExecutive.winRate}%.`
    : "";

  const financeNote = input.financeExecutive
    ? ` Financeiro em ${input.financeExecutive.financeHealthScore}/100 com margem ${input.financeExecutive.profitMargin}%.`
    : "";

  const operationsNote = input.operationsExecutive
    ? ` Operações em ${input.operationsExecutive.operationsHealthScore}/100 com produtividade ${input.operationsExecutive.productivityScore}/100.`
    : "";

  const hrNote = input.hrExecutive
    ? ` RH em ${input.hrExecutive.hrHealthScore}/100 com engagement ${input.hrExecutive.engagementScore}/100.`
    : "";

  const legalNote = input.legalExecutive
    ? ` Jurídico em ${input.legalExecutive.legalHealthScore}/100 com compliance ${input.legalExecutive.complianceScore}/100.`
    : "";

  const googleBusinessNote = input.googleBusinessExecutive
    ? ` Google Business em ${input.googleBusinessExecutive.googleBusinessHealthScore}/100 com reputação ${input.googleBusinessExecutive.reputationScore}/100.`
    : "";

  const metaNote = input.metaExecutive
    ? ` Meta em ${input.metaExecutive.metaHealthScore}/100 com ROAS ${input.metaExecutive.roas}x.`
    : "";

  const linkedInNote = input.linkedInExecutive
    ? ` LinkedIn em ${input.linkedInExecutive.linkedInHealthScore}/100 com leads B2B ${input.linkedInExecutive.leadGenerationScore}/100.`
    : "";

  return `Olá, sou o CEO Digital da ${company}. ${tone} Saúde operacional em ${companyHealth.score}/100, potencial de crescimento ${growthScore}/100 e risco consolidado ${riskScore}/100.${crmNote}${marketingNote}${salesNote}${financeNote}${operationsNote}${hrNote}${legalNote}${googleBusinessNote}${metaNote}${linkedInNote} Meta de crescimento: ${growth}. Minha diretriz imediata: ${topAction}. Confio no motor executivo Samuel AI™ para converter estratégia em resultados mensuráveis.`;
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
    input.metaExecutive ||
    input.linkedInExecutive ||
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
    executiveDecision: buildTopDecision(input),
    executiveRecommendation: buildTopRecommendation(input),
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
