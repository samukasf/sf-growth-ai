import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ExecutiveCEO } from "../services/executive-ceo.service";
import type { ExecutiveDecision } from "../services/executive-decision.service";
import type { ExecutiveForecast } from "../services/executive-forecast.service";
import type { ExecutiveIntelligence } from "../services/executive-intelligence.service";
import type { ExecutiveLearning } from "../services/executive-learning.service";
import type { ExecutiveMonitoring } from "../services/executive-monitoring.service";
import type { ExecutivePriority, RiskLevel } from "../services/executive-priority.service";
import type { ExecutiveRecommendation } from "../services/executive-recommendation.service";
import type { ExecutiveStrategy } from "../services/executive-strategy.service";

export type ExecutiveRiskLevel = RiskLevel;

export type ExecutiveSituation = {
  principalProblem: string;
  principalOpportunity: string;
  currentPriority: string;
  executiveSummary: string;
  executiveRiskLevel: ExecutiveRiskLevel;
  recommendedDecision: string;
  recommendedExecution: string;
  confidenceScore: number;
  supportingEvidence: string[];
};

export type BuildExecutiveSituationInput = {
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  monitoring?: ExecutiveMonitoring | null;
  forecast?: ExecutiveForecast | null;
  learning?: ExecutiveLearning | null;
  strategy?: ExecutiveStrategy | null;
  priority?: ExecutivePriority | null;
  recommendation?: ExecutiveRecommendation | null;
  ceo?: ExecutiveCEO | null;
};

const RISK_RANK: Record<ExecutiveRiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskLevelFromScore(score: number): ExecutiveRiskLevel {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function maxRiskLevel(
  ...levels: Array<ExecutiveRiskLevel | null | undefined>
): ExecutiveRiskLevel {
  return levels.reduce<ExecutiveRiskLevel>(
    (current, level) =>
      level && RISK_RANK[level] > RISK_RANK[current] ? level : current,
    "low",
  );
}

function topDecision(decisions: ExecutiveDecision[] | undefined): ExecutiveDecision | null {
  if (!decisions?.length) return null;

  const priorityOrder: Record<ExecutiveDecision["priority"], number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };

  return [...decisions].sort(
    (left, right) => priorityOrder[left.priority] - priorityOrder[right.priority],
  )[0];
}

function resolvePrincipalProblem(input: BuildExecutiveSituationInput): string {
  if (input.ceo?.executiveDecision) {
    return input.ceo.executiveDecision;
  }

  const criticalAlert = input.monitoring?.alerts.find(
    (alert) => alert.severity === "critical" || alert.severity === "high",
  );
  if (criticalAlert) {
    return `${criticalAlert.title}: ${criticalAlert.message}`;
  }

  if (input.intelligence?.risks[0]) {
    return input.intelligence.risks[0];
  }

  const riskInsight = input.learning?.insights.find(
    (insight) => insight.category === "risk",
  );
  if (riskInsight) {
    return `${riskInsight.title}: ${riskInsight.description}`;
  }

  const decision = topDecision(input.decisions);
  if (decision && (decision.priority === "Critical" || decision.priority === "High")) {
    return `${decision.title}: ${decision.description}`;
  }

  if (input.priority?.riskLevel === "critical" || input.priority?.riskLevel === "high") {
    return `Risco ${input.priority.riskLevel} na fila de prioridades — ${input.priority.criticalTasks.length} tarefa(s) crítica(s) ativa(s).`;
  }

  return "Nenhum problema crítico consolidado no ciclo atual.";
}

function resolvePrincipalOpportunity(input: BuildExecutiveSituationInput): string {
  if (input.ceo?.topPriorities[1]) {
    return input.ceo.topPriorities[1];
  }

  if (input.intelligence?.opportunities[0]) {
    return input.intelligence.opportunities[0];
  }

  const opportunityInsight = input.learning?.insights.find(
    (insight) => insight.category === "opportunity",
  );
  if (opportunityInsight) {
    return `${opportunityInsight.title}: ${opportunityInsight.description}`;
  }

  const recommendedInvestment = input.recommendation?.recommendedInvestments[0];
  if (recommendedInvestment) {
    return `${recommendedInvestment.title}: ${recommendedInvestment.description}`;
  }

  const expectedScenario = input.forecast?.scenarios.find(
    (scenario) => scenario.type === "expected",
  );
  const scenarioOpportunity = expectedScenario?.opportunities[0];
  if (scenarioOpportunity) {
    return `${scenarioOpportunity.title}: ${scenarioOpportunity.description}`;
  }

  if (input.intelligence?.strengths[0]) {
    return `Alavancar força identificada: ${input.intelligence.strengths[0]}`;
  }

  return "Consolidar contexto estratégico para mapear oportunidades de alto impacto.";
}

function resolveCurrentPriority(input: BuildExecutiveSituationInput): string {
  if (input.priority?.top10Priorities[0]?.title) {
    return input.priority.top10Priorities[0].title;
  }

  if (input.ceo?.topPriorities[0]) {
    return input.ceo.topPriorities[0];
  }

  if (input.strategy?.topPriorities[0]) {
    return input.strategy.topPriorities[0];
  }

  if (input.priority?.executivePrioritySummary) {
    return (
      input.priority.executivePrioritySummary.split(".")[0] ??
      input.priority.executivePrioritySummary
    );
  }

  if (input.intelligence?.priorities[0]) {
    return input.intelligence.priorities[0];
  }

  return "Consolidar contexto operacional e definir a próxima ação estratégica.";
}

function resolveExecutiveSummary(input: BuildExecutiveSituationInput): string {
  if (input.ceo?.executiveSummary) {
    return input.ceo.executiveSummary;
  }

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

  if (input.learning?.evolution.summary) {
    parts.push(input.learning.evolution.summary);
  }

  if (input.monitoring) {
    parts.push(
      `Execução em ${input.monitoring.progress.overall}% · ${input.monitoring.progress.overdueTasks} tarefa(s) atrasada(s).`,
    );
  }

  if (input.forecast) {
    parts.push(
      `Crescimento projetado ${input.forecast.expectedGrowth} · probabilidade de sucesso ${input.forecast.successProbability}%.`,
    );
  }

  if (parts.length === 0) {
    return `${company} — situação executiva em consolidação. Conecte contexto e dados operacionais para ativar o raciocínio executivo.`;
  }

  return parts.join(" ");
}

function resolveExecutiveRiskLevel(input: BuildExecutiveSituationInput): ExecutiveRiskLevel {
  const fromCeo = input.ceo ? riskLevelFromScore(input.ceo.riskScore) : null;
  const fromPriority = input.priority?.riskLevel ?? null;
  const fromRecommendation = input.recommendation?.recommendedRisks[0]?.risk ?? null;

  return maxRiskLevel(fromCeo, fromPriority, fromRecommendation);
}

function resolveRecommendedDecision(input: BuildExecutiveSituationInput): string {
  const decision = topDecision(input.decisions);
  if (decision) {
    return `${decision.title}: ${decision.description}`;
  }

  const recommendation = input.recommendation?.executiveRecommendations[0];
  if (recommendation) {
    return `${recommendation.title}: ${recommendation.description}`;
  }

  const strategyAction = input.strategy?.growthPlan30d.actions[0];
  if (strategyAction) {
    return strategyAction;
  }

  if (input.ceo?.executiveDecision) {
    return input.ceo.executiveDecision;
  }

  return "Definir decisão executiva a partir da prioridade consolidada do ciclo.";
}

function resolveRecommendedExecution(input: BuildExecutiveSituationInput): string {
  if (input.ceo?.executiveRecommendation) {
    return input.ceo.executiveRecommendation;
  }

  const recommendedAction = input.recommendation?.recommendedActions[0];
  if (recommendedAction) {
    return `${recommendedAction.title}: ${recommendedAction.description}`;
  }

  if (input.ceo?.nextActions[0]) {
    return input.ceo.nextActions[0];
  }

  const forecastRecommendation = input.forecast?.recommendations[0];
  if (forecastRecommendation) {
    return `${forecastRecommendation.title}: ${forecastRecommendation.description}`;
  }

  const learningRule = input.learning?.rules.find(
    (rule) => rule.priority === "critical" || rule.priority === "high",
  );
  if (learningRule) {
    return `${learningRule.title}: ${learningRule.rule}`;
  }

  return "Executar a prioridade do dia e revisar KPIs no próximo ciclo de monitoramento.";
}

function resolveConfidenceScore(input: BuildExecutiveSituationInput): number {
  const scores: number[] = [];

  if (input.recommendation?.confidenceLevel != null) {
    scores.push(input.recommendation.confidenceLevel);
  }

  if (input.strategy?.confidenceScore != null) {
    scores.push(input.strategy.confidenceScore);
  }

  if (input.forecast?.confidence.overall != null) {
    scores.push(input.forecast.confidence.overall);
  }

  if (input.ceo?.executiveScore != null) {
    scores.push(input.ceo.executiveScore);
  }

  if (input.learning?.evolutionScore != null) {
    scores.push(input.learning.evolutionScore);
  }

  if (scores.length === 0) {
    return 50;
  }

  return clampScore(
    scores.reduce((total, score) => total + score, 0) / scores.length,
  );
}

function buildSupportingEvidence(input: BuildExecutiveSituationInput): string[] {
  const evidence: string[] = [];

  for (const alert of input.monitoring?.alerts.slice(0, 2) ?? []) {
    evidence.push(`${alert.title}: ${alert.message}`);
  }

  for (const indicator of input.monitoring?.indicators.slice(0, 2) ?? []) {
    evidence.push(indicator);
  }

  if (input.intelligence?.executiveSummary) {
    evidence.push(input.intelligence.executiveSummary);
  }

  for (const weakness of input.intelligence?.weaknesses.slice(0, 1) ?? []) {
    evidence.push(`Fraqueza: ${weakness}`);
  }

  for (const strength of input.intelligence?.strengths.slice(0, 1) ?? []) {
    evidence.push(`Força: ${strength}`);
  }

  if (input.priority?.executivePrioritySummary) {
    evidence.push(input.priority.executivePrioritySummary);
  }

  for (const insight of input.learning?.insights.slice(0, 2) ?? []) {
    evidence.push(`${insight.title}: ${insight.description}`);
  }

  for (const lesson of input.learning?.lessonsLearned.slice(0, 1) ?? []) {
    evidence.push(`Aprendizado: ${lesson}`);
  }

  const decision = topDecision(input.decisions);
  if (decision?.reason) {
    evidence.push(`Decisão: ${decision.reason}`);
  }

  if (input.forecast?.futureAlerts[0]) {
    evidence.push(input.forecast.futureAlerts[0]);
  }

  if (input.strategy?.strategicVision) {
    evidence.push(`Visão: ${input.strategy.strategicVision}`);
  }

  if (input.recommendation?.executiveRecommendationSummary) {
    evidence.push(input.recommendation.executiveRecommendationSummary);
  }

  if (evidence.length === 0 && input.context?.summary) {
    const summaryLine = input.context.summary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(". ");
    if (summaryLine) evidence.push(summaryLine);
  }

  return [...new Set(evidence)].slice(0, 8);
}

export function buildExecutiveSituation(
  input: BuildExecutiveSituationInput = {},
): ExecutiveSituation {
  return {
    principalProblem: resolvePrincipalProblem(input),
    principalOpportunity: resolvePrincipalOpportunity(input),
    currentPriority: resolveCurrentPriority(input),
    executiveSummary: resolveExecutiveSummary(input),
    executiveRiskLevel: resolveExecutiveRiskLevel(input),
    recommendedDecision: resolveRecommendedDecision(input),
    recommendedExecution: resolveRecommendedExecution(input),
    confidenceScore: resolveConfidenceScore(input),
    supportingEvidence: buildSupportingEvidence(input),
  };
}
