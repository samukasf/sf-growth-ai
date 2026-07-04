import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutionPlan } from "./executive-execution-planner.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveLearning } from "./executive-learning.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";

export type StrategicHorizon = "quarterly" | "annual";

export type StrategicObjective = {
  id: string;
  title: string;
  description: string;
  horizon: StrategicHorizon;
  priority: "critical" | "high" | "medium" | "low";
  metric: string;
};

export type StrategicInitiative = {
  id: string;
  title: string;
  description: string;
  pillar: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  deadline: string;
};

export type StrategicPillar = {
  id: string;
  name: string;
  description: string;
  focus: string;
  score: number;
};

export type StrategicRisk = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  mitigation: string;
};

export type StrategicAdvantage = {
  id: string;
  title: string;
  description: string;
  durability: "high" | "medium" | "low";
};

export type CompetitiveMove = {
  id: string;
  title: string;
  description: string;
  timing: string;
  expectedOutcome: string;
};

export type StrategicRoadmap = {
  id: string;
  phase: string;
  period: string;
  milestones: string[];
  focus: string;
};

export type SwotAnalysis = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

export type ImpactEffortItem = {
  id: string;
  title: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  quadrant: "quick_wins" | "major_projects" | "fill_ins" | "thankless";
};

export type ExecutiveStrategy = {
  strategicScore: number;
  summary: string;
  objectives: StrategicObjective[];
  quarterlyPriorities: string[];
  annualPriorities: string[];
  advantages: StrategicAdvantage[];
  risks: StrategicRisk[];
  competitiveMoves: CompetitiveMove[];
  roadmap: StrategicRoadmap[];
  pillars: StrategicPillar[];
  initiatives: StrategicInitiative[];
  swot: SwotAnalysis;
  impactEffortMatrix: ImpactEffortItem[];
  nextMoves: CompetitiveMove[];
};

export type ExecutiveStrategyInput = {
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  monitoring?: ExecutiveMonitoring | null;
  learning?: ExecutiveLearning | null;
  forecast?: ExecutiveForecast | null;
};

function getQuadrant(
  impact: ImpactEffortItem["impact"],
  effort: ImpactEffortItem["effort"],
): ImpactEffortItem["quadrant"] {
  if (impact === "high" && effort === "low") return "quick_wins";
  if (impact === "high" && effort === "high") return "major_projects";
  if (impact === "low" && effort === "low") return "fill_ins";
  return "thankless";
}

function buildSwot(input: ExecutiveStrategyInput): SwotAnalysis {
  return {
    strengths: [
      ...(input.intelligence?.strengths ?? []),
      ...(input.learning?.lessonsLearned.slice(0, 2) ?? []),
    ].slice(0, 6),
    weaknesses: (input.intelligence?.weaknesses ?? []).slice(0, 6),
    opportunities: [
      ...(input.intelligence?.opportunities ?? []),
      ...(input.forecast?.scenarios
        .find((s) => s.type === "expected")
        ?.opportunities.map((o) => o.description) ?? []),
    ].slice(0, 6),
    threats: [
      ...(input.intelligence?.risks ?? []),
      ...(input.forecast?.futureAlerts ?? []),
    ].slice(0, 6),
  };
}

function buildObjectives(input: ExecutiveStrategyInput): StrategicObjective[] {
  const objectives: StrategicObjective[] = [];
  let index = 0;

  for (const priority of input.intelligence?.priorities.slice(0, 3) ?? []) {
    objectives.push({
      id: `obj-q-${index++}`,
      title: priority.split(/[.—]/)[0]?.trim() ?? priority,
      description: priority,
      horizon: "quarterly",
      priority: "critical",
      metric: "Conclusão em 90 dias",
    });
  }

  for (const decision of input.decisions?.filter((d) => d.priority === "Critical").slice(0, 2) ?? []) {
    objectives.push({
      id: `obj-a-${index++}`,
      title: decision.title,
      description: decision.description,
      horizon: "annual",
      priority: "high",
      metric: decision.estimatedROI,
    });
  }

  if (objectives.length === 0) {
    objectives.push({
      id: "obj-default",
      title: "Consolidar maturidade estratégica",
      description:
        "Estruturar contexto, memória e execução para elevar qualidade decisória.",
      horizon: "annual",
      priority: "high",
      metric: "Score estratégico ≥ 70",
    });
  }

  return objectives;
}

function buildPillars(input: ExecutiveStrategyInput): StrategicPillar[] {
  const segment =
    input.context?.businessProfile?.segment ??
    input.context?.company.industry ??
    "Negócio";

  return [
    {
      id: "pillar-growth",
      name: "Crescimento",
      description: `Acelerar receita e participação no segmento ${segment}.`,
      focus: input.forecast?.expectedGrowth ?? "+10%",
      score: Math.min(95, 50 + (input.forecast?.successProbability ?? 0) * 0.3),
    },
    {
      id: "pillar-brand",
      name: "Marca & Posicionamento",
      description: "Fortalecer narrativa, diferenciação e autoridade de mercado.",
      focus:
        input.context?.businessProfile?.positioning ?? "Definir posicionamento",
      score: Math.min(
        90,
        40 + (input.intelligence?.strengths.length ?? 0) * 8,
      ),
    },
    {
      id: "pillar-ops",
      name: "Execução Operacional",
      description: "Converter decisões em planos com monitoramento contínuo.",
      focus: `${input.executionPlans?.length ?? 0} plano(s) ativo(s)`,
      score: Math.max(
        20,
        70 - (input.monitoring?.progress.delayRisk ?? 0) * 0.4,
      ),
    },
    {
      id: "pillar-intelligence",
      name: "Inteligência Executiva",
      description: "Aprender continuamente e prever cenários futuros.",
      focus: `Evolução ${input.learning?.evolutionScore ?? 0}/100`,
      score: input.learning?.evolutionScore ?? 45,
    },
  ];
}

function buildInitiatives(input: ExecutiveStrategyInput): StrategicInitiative[] {
  const fromDecisions: StrategicInitiative[] = (input.decisions ?? [])
    .slice(0, 6)
    .map((decision) => ({
      id: `initiative-${decision.id}`,
      title: decision.title,
      description: decision.description,
      pillar:
        decision.impact === "Marketing"
          ? "Marca & Posicionamento"
          : decision.impact === "Receita" || decision.impact === "Vendas"
            ? "Crescimento"
            : "Execução Operacional",
      impact:
        decision.priority === "Critical" || decision.priority === "High"
          ? "high"
          : "medium",
      effort:
        decision.difficulty === "Alta"
          ? "high"
          : decision.difficulty === "Média"
            ? "medium"
            : "low",
      deadline: decision.deadline,
    }));

  const fromPlans: StrategicInitiative[] = (input.executionPlans ?? [])
    .slice(0, 2)
    .map((plan) => ({
      id: `initiative-plan-${plan.id}`,
      title: plan.title.replace("Plano de Execução — ", ""),
      description: plan.objective,
      pillar: "Execução Operacional",
      impact: "high",
      effort: "medium",
      deadline: plan.deadline,
    }));

  return [...fromDecisions, ...fromPlans].slice(0, 8);
}

function buildImpactEffortMatrix(
  initiatives: StrategicInitiative[],
): ImpactEffortItem[] {
  return initiatives.map((initiative) => ({
    id: `matrix-${initiative.id}`,
    title: initiative.title,
    impact: initiative.impact,
    effort: initiative.effort,
    quadrant: getQuadrant(initiative.impact, initiative.effort),
  }));
}

function buildAdvantages(input: ExecutiveStrategyInput): StrategicAdvantage[] {
  const advantages: StrategicAdvantage[] = [];
  let index = 0;

  for (const strength of input.intelligence?.strengths ?? []) {
    advantages.push({
      id: `adv-${index++}`,
      title: strength.split(/[.:]/)[0]?.trim() ?? "Vantagem",
      description: strength,
      durability:
        strength.toLowerCase().includes("memória") ||
        strength.toLowerCase().includes("memoria")
          ? "high"
          : "medium",
    });
  }

  if (input.context?.businessProfile?.differentiators) {
    const diff = input.context.businessProfile.differentiators;
    advantages.push({
      id: `adv-${index++}`,
      title: "Diferenciais competitivos",
      description: Array.isArray(diff) ? diff.join(" · ") : diff,
      durability: "high",
    });
  }

  return advantages.slice(0, 6);
}

function buildStrategicRisks(input: ExecutiveStrategyInput): StrategicRisk[] {
  const risks: StrategicRisk[] = [];
  let index = 0;

  for (const risk of input.intelligence?.risks ?? []) {
    risks.push({
      id: `srisk-${index++}`,
      title: "Risco estratégico",
      description: risk,
      severity: "high",
      mitigation: "Converter em decisão com prazo e indicador de sucesso.",
    });
  }

  for (const alert of input.monitoring?.alerts.slice(0, 2) ?? []) {
    risks.push({
      id: `srisk-${index++}`,
      title: alert.title,
      description: alert.message,
      severity: alert.severity === "critical" ? "critical" : "high",
      mitigation: "Escalar para comitê executivo em 48 horas.",
    });
  }

  return risks.slice(0, 6);
}

function buildCompetitiveMoves(input: ExecutiveStrategyInput): CompetitiveMove[] {
  const moves: CompetitiveMove[] = [];
  let index = 0;

  for (const rec of input.forecast?.recommendations.slice(0, 2) ?? []) {
    moves.push({
      id: `move-${index++}`,
      title: rec.title,
      description: rec.description,
      timing: rec.horizon,
      expectedOutcome: "Aceleração de resultado no cenário esperado",
    });
  }

  for (const decision of input.decisions?.filter((d) => d.priority === "Critical").slice(0, 2) ?? []) {
    moves.push({
      id: `move-${index++}`,
      title: decision.title,
      description: decision.reason,
      timing: decision.deadline,
      expectedOutcome: decision.estimatedROI,
    });
  }

  for (const practice of input.learning?.bestPractices.slice(0, 1) ?? []) {
    moves.push({
      id: `move-${index++}`,
      title: "Institucionalizar boa prática",
      description: practice,
      timing: "30 dias",
      expectedOutcome: "Maior consistência decisória",
    });
  }

  return moves.slice(0, 6);
}

function buildRoadmap(input: ExecutiveStrategyInput): StrategicRoadmap[] {
  const companyName = input.context?.company.name ?? "Empresa";

  return [
    {
      id: "roadmap-q1",
      phase: "Fase 1 — Fundação",
      period: "0–90 dias",
      milestones: [
        "Kickoff dos planos críticos",
        ...(input.executionPlans?.[0]?.nextSteps.slice(0, 2) ?? []),
        "SWOT e matriz impacto × esforço validados",
      ],
      focus: `Estabilizar execução de ${companyName}`,
    },
    {
      id: "roadmap-q2",
      phase: "Fase 2 — Aceleração",
      period: "90–180 dias",
      milestones: [
        ...(input.intelligence?.priorities.slice(0, 2) ?? []),
        "KPIs trimestrais acima de 70%",
        "Primeiras memórias estratégicas de resultado",
      ],
      focus: "Capturar oportunidades de alto impacto",
    },
    {
      id: "roadmap-q3",
      phase: "Fase 3 — Escala",
      period: "180–365 dias",
      milestones: [
        `Crescimento esperado: ${input.forecast?.expectedGrowth ?? "+10%"}`,
        "Roadmap anual revisado com cenários de forecast",
        "Score de evolução acima de 75",
      ],
      focus: "Escalar vantagens competitivas sustentáveis",
    },
  ];
}

function calculateStrategicScore(input: ExecutiveStrategyInput): number {
  let score = 30;

  score += Math.min(15, (input.intelligence?.strengths.length ?? 0) * 3);
  score += Math.min(12, (input.decisions?.length ?? 0) * 2);
  score += Math.min(10, (input.executionPlans?.length ?? 0) * 2);
  score += Math.min(10, (input.learning?.evolutionScore ?? 0) * 0.1);
  score += Math.min(10, (input.forecast?.confidence.overall ?? 0) * 0.1);
  score += Math.min(8, (input.context?.memories.length ?? 0) * 2);

  score -= Math.min(18, (input.intelligence?.weaknesses.length ?? 0) * 2);
  score -= Math.min(12, Math.round((input.monitoring?.progress.delayRisk ?? 0) * 0.12));

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildSummary(
  input: ExecutiveStrategyInput,
  score: number,
): string {
  const company = input.context?.company.name ?? "A empresa";
  const maturity =
    score >= 75
      ? "avançada"
      : score >= 55
        ? "em consolidação"
        : score >= 35
          ? "em formação"
          : "inicial";

  return `${company} opera com maturidade estratégica ${maturity} (score ${score}/100). O motor integra contexto, memória, inteligência, decisões, execução, monitoramento, aprendizado e forecast para definir objetivos, roadmap e próximos movimentos competitivos.`;
}

export function buildExecutiveStrategy(
  input: ExecutiveStrategyInput = {},
): ExecutiveStrategy | null {
  const hasData =
    input.context ||
    input.intelligence ||
    input.monitoring ||
    input.learning ||
    input.forecast ||
    (input.decisions?.length ?? 0) > 0;

  if (!hasData) return null;

  const swot = buildSwot(input);
  const objectives = buildObjectives(input);
  const pillars = buildPillars(input);
  const initiatives = buildInitiatives(input);
  const competitiveMoves = buildCompetitiveMoves(input);
  const strategicScore = calculateStrategicScore(input);

  return {
    strategicScore,
    summary: buildSummary(input, strategicScore),
    objectives,
    quarterlyPriorities: [
      ...(input.intelligence?.priorities ?? []),
      ...(input.monitoring?.bottlenecks.slice(0, 2) ?? []),
    ].slice(0, 5),
    annualPriorities: [
      ...(input.learning?.permanentRecommendations ?? []),
      ...(input.forecast?.recommendations.map((r) => r.title) ?? []),
      ...(input.decisions?.filter((d) => d.priority === "Critical").map((d) => d.title) ?? []),
    ].slice(0, 5),
    advantages: buildAdvantages(input),
    risks: buildStrategicRisks(input),
    competitiveMoves,
    roadmap: buildRoadmap(input),
    pillars,
    initiatives,
    swot,
    impactEffortMatrix: buildImpactEffortMatrix(initiatives),
    nextMoves: competitiveMoves.slice(0, 4),
  };
}
