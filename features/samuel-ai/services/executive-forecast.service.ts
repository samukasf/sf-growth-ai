import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveLearning } from "./executive-learning.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";

export type ForecastHorizon = "30d" | "90d" | "180d" | "365d";

export type ForecastScenarioType = "conservative" | "expected" | "aggressive";

export type ForecastRisk = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  horizon: ForecastHorizon;
};

export type ForecastOpportunity = {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  horizon: ForecastHorizon;
};

export type ForecastScenario = {
  id: string;
  type: ForecastScenarioType;
  label: string;
  projectedRevenue: string;
  projectedProfit: string;
  costs: string;
  roi: string;
  risks: ForecastRisk[];
  opportunities: ForecastOpportunity[];
  probability: number;
};

export type ForecastTimeline = {
  horizon: ForecastHorizon;
  label: string;
  revenue: string;
  growth: string;
  leads: string;
  conversions: string;
  cashFlow: string;
};

export type ForecastConfidence = {
  overall: number;
  revenue: number;
  growth: number;
  operations: number;
  marketing: number;
  rationale: string;
};

export type ForecastRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  horizon: string;
};

export type ForecastTrend = {
  metric: string;
  direction: "up" | "down" | "stable";
  value: string;
  change: string;
};

export type ExecutiveForecast = {
  scenarios: ForecastScenario[];
  timelines: ForecastTimeline[];
  confidence: ForecastConfidence;
  recommendations: ForecastRecommendation[];
  futureAlerts: string[];
  expectedGrowth: string;
  successProbability: number;
  trends: ForecastTrend[];
  predictions: {
    revenue: string;
    growth: string;
    cashFlow: string;
    leads: string;
    conversions: string;
    marketing: string;
    operationalPerformance: string;
    bottlenecks: string[];
    customerChurn: string;
    financialRisk: string;
  };
};

export type ExecutiveForecastInput = {
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  monitoring?: ExecutiveMonitoring | null;
  learning?: ExecutiveLearning | null;
};

const HORIZON_LABELS: Record<ForecastHorizon, string> = {
  "30d": "30 dias",
  "90d": "90 dias",
  "180d": "180 dias",
  "365d": "365 dias",
};

const SCENARIO_MULTIPLIERS = {
  conservative: { growth: 0.03, cost: 0.72, roi: 1.8, probability: 78 },
  expected: { growth: 0.1, cost: 0.65, roi: 2.8, probability: 62 },
  aggressive: { growth: 0.22, cost: 0.58, roi: 4.2, probability: 41 },
} as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function deriveBaseMonthlyRevenue(context: ExecutiveContext | null | undefined) {
  const annual = context?.company.annual_revenue;
  if (annual && annual > 0) {
    return annual / 12;
  }
  return 48_200;
}

function deriveGrowthModifiers(input: ExecutiveForecastInput) {
  const strengthBoost = (input.intelligence?.strengths.length ?? 0) * 1.2;
  const weaknessPenalty = (input.intelligence?.weaknesses.length ?? 0) * 1.5;
  const delayPenalty = (input.monitoring?.progress.delayRisk ?? 0) * 0.08;
  const learningBoost = (input.learning?.evolutionScore ?? 0) * 0.05;
  const decisionBoost = Math.min(8, (input.decisions?.length ?? 0) * 0.8);
  const memoryBoost = Math.min(6, (input.context?.memories.length ?? 0) * 1.5);

  return {
    net:
      strengthBoost +
      learningBoost +
      decisionBoost +
      memoryBoost -
      weaknessPenalty -
      delayPenalty,
    delayPenalty,
    weaknessCount: input.intelligence?.weaknesses.length ?? 0,
    strengthCount: input.intelligence?.strengths.length ?? 0,
  };
}

function projectRevenue(baseMonthly: number, growthRate: number, months: number) {
  return baseMonthly * months * (1 + growthRate);
}

function buildScenarioRisks(
  type: ForecastScenarioType,
  input: ExecutiveForecastInput,
  horizon: ForecastHorizon,
): ForecastRisk[] {
  const risks: ForecastRisk[] = [];
  let index = 0;

  if ((input.monitoring?.progress.delayRisk ?? 0) >= 40) {
    risks.push({
      id: `risk-${type}-${index++}`,
      title: "Risco de atraso operacional",
      description: `Risco de atraso em ${HORIZON_LABELS[horizon]} por execução não iniciada.`,
      severity: type === "aggressive" ? "critical" : "high",
      horizon,
    });
  }

  for (const risk of input.intelligence?.risks.slice(0, 2) ?? []) {
    risks.push({
      id: `risk-${type}-${index++}`,
      title: "Risco estratégico mapeado",
      description: risk,
      severity: type === "conservative" ? "medium" : "high",
      horizon,
    });
  }

  if (type === "aggressive") {
    risks.push({
      id: `risk-${type}-${index++}`,
      title: "Risco financeiro por aceleração",
      description:
        "Cenário agressivo exige investimento antecipado com retorno concentrado no médio prazo.",
      severity: "high",
      horizon,
    });
  }

  if ((input.intelligence?.weaknesses.length ?? 0) >= 3) {
    risks.push({
      id: `risk-${type}-${index++}`,
      title: "Perda de clientes por posicionamento fraco",
      description:
        "Fraquezas estruturais elevam churn e pressionam receita recorrente.",
      severity: "medium",
      horizon,
    });
  }

  return risks;
}

function buildScenarioOpportunities(
  type: ForecastScenarioType,
  input: ExecutiveForecastInput,
  horizon: ForecastHorizon,
): ForecastOpportunity[] {
  const opportunities: ForecastOpportunity[] = [];
  let index = 0;

  for (const item of input.intelligence?.opportunities.slice(0, 3) ?? []) {
    opportunities.push({
      id: `opp-${type}-${index++}`,
      title: "Oportunidade identificada",
      description: item,
      impact: type === "aggressive" ? "high" : "medium",
      horizon,
    });
  }

  if (type !== "conservative") {
    opportunities.push({
      id: `opp-${type}-${index++}`,
      title: "Expansão de marketing digital",
      description:
        "Presença digital e campanhas segmentadas podem acelerar leads qualificados.",
      impact: "high",
      horizon,
    });
  }

  return opportunities;
}

function buildScenarios(
  baseMonthly: number,
  modifiers: ReturnType<typeof deriveGrowthModifiers>,
  input: ExecutiveForecastInput,
): ForecastScenario[] {
  return (Object.keys(SCENARIO_MULTIPLIERS) as ForecastScenarioType[]).map(
    (type) => {
      const config = SCENARIO_MULTIPLIERS[type];
      const adjustedGrowth = Math.max(
        -0.05,
        config.growth + modifiers.net / 100,
      );
      const annualRevenue = projectRevenue(baseMonthly, adjustedGrowth, 12);
      const costs = annualRevenue * config.cost;
      const profit = annualRevenue - costs;
      const roi = `${config.roi.toFixed(1)}x`;

      const probability = Math.min(
        95,
        Math.max(
          15,
          config.probability +
            modifiers.strengthCount * 2 -
            modifiers.weaknessCount * 3 -
            Math.round(modifiers.delayPenalty),
        ),
      );

      return {
        id: `scenario-${type}`,
        type,
        label:
          type === "conservative"
            ? "Conservador"
            : type === "expected"
              ? "Esperado"
              : "Agressivo",
        projectedRevenue: formatCurrency(annualRevenue),
        projectedProfit: formatCurrency(profit),
        costs: formatCurrency(costs),
        roi,
        risks: buildScenarioRisks(type, input, "365d"),
        opportunities: buildScenarioOpportunities(type, input, "365d"),
        probability,
      };
    },
  );
}

function buildTimelines(
  baseMonthly: number,
  modifiers: ReturnType<typeof deriveGrowthModifiers>,
): ForecastTimeline[] {
  const horizons: Array<{ horizon: ForecastHorizon; months: number }> = [
    { horizon: "30d", months: 1 },
    { horizon: "90d", months: 3 },
    { horizon: "180d", months: 6 },
    { horizon: "365d", months: 12 },
  ];

  const growthRate = Math.max(0.02, 0.1 + modifiers.net / 100);

  return horizons.map(({ horizon, months }) => {
    const revenue = projectRevenue(baseMonthly, growthRate, months);
    const growth = formatPercent(growthRate * 100 * (months / 12));
    const leads = Math.round(186 * (1 + growthRate * months));
    const conversions = `${(1.2 * (1 + growthRate * 0.5)).toFixed(1)}%`;
    const cashFlow = formatCurrency(revenue * 0.28);

    return {
      horizon,
      label: HORIZON_LABELS[horizon],
      revenue: formatCurrency(revenue),
      growth,
      leads: `${leads}`,
      conversions,
      cashFlow,
    };
  });
}

function buildConfidence(input: ExecutiveForecastInput): ForecastConfidence {
  const evolution = input.learning?.evolutionScore ?? 45;
  const memoryFactor = Math.min(20, (input.context?.memories.length ?? 0) * 4);
  const strengthFactor = Math.min(15, (input.intelligence?.strengths.length ?? 0) * 3);
  const delayPenalty = Math.round(
    (input.monitoring?.progress.delayRisk ?? 0) * 0.2,
  );

  const overall = Math.max(
    20,
    Math.min(92, evolution + memoryFactor + strengthFactor - delayPenalty),
  );

  return {
    overall,
    revenue: Math.max(15, overall - 5),
    growth: Math.max(10, overall - 8 + strengthFactor),
    operations: Math.max(
      10,
      overall - 10 - Math.round((input.monitoring?.progress.delayRisk ?? 0) * 0.15),
    ),
    marketing: Math.max(
      12,
      overall -
        6 +
        (input.decisions?.filter((d) => d.impact === "Marketing").length ?? 0) *
          3,
    ),
    rationale:
      "Confiança calculada a partir de memórias, inteligência estratégica, monitoramento e aprendizado acumulado.",
  };
}

function buildRecommendations(
  input: ExecutiveForecastInput,
): ForecastRecommendation[] {
  const recommendations: ForecastRecommendation[] = [];
  let index = 0;

  if ((input.monitoring?.progress.notStartedPlans ?? 0) > 0) {
    recommendations.push({
      id: `rec-${index++}`,
      title: "Iniciar execução imediata",
      description:
        "Previsões positivas dependem de kickoff dos planos já definidos nos próximos 7 dias.",
      priority: "critical",
      horizon: "30 dias",
    });
  }

  for (const priority of input.intelligence?.priorities.slice(0, 2) ?? []) {
    recommendations.push({
      id: `rec-${index++}`,
      title: "Prioridade estratégica",
      description: priority,
      priority: "high",
      horizon: "90 dias",
    });
  }

  for (const rule of input.learning?.rules.filter((r) => r.priority === "critical").slice(0, 1) ?? []) {
    recommendations.push({
      id: `rec-${index++}`,
      title: rule.title,
      description: rule.rule,
      priority: "critical",
      horizon: "180 dias",
    });
  }

  recommendations.push({
    id: `rec-${index++}`,
    title: "Revisão trimestral de cenários",
    description:
      "Recalibrar cenários conservador, esperado e agressivo a cada 90 dias com novos KPIs.",
    priority: "medium",
    horizon: "90 dias",
  });

  return recommendations;
}

function buildFutureAlerts(input: ExecutiveForecastInput): string[] {
  const alerts: string[] = [];

  if ((input.monitoring?.progress.delayRisk ?? 0) >= 50) {
    alerts.push("Alto risco de estagnação de receita nos próximos 30 dias sem kickoff.");
  }

  if ((input.intelligence?.weaknesses.length ?? 0) >= 3) {
    alerts.push("Fraquezas estruturais podem limitar crescimento esperado em 90 dias.");
  }

  if (!input.context?.company.website) {
    alerts.push("Ausência de website pode reduzir conversões em até 25% no horizonte de 180 dias.");
  }

  for (const alert of input.monitoring?.alerts.slice(0, 2) ?? []) {
    alerts.push(`[${alert.title}] ${alert.message}`);
  }

  if (alerts.length === 0) {
    alerts.push("Nenhum alerta crítico projetado — manter cadência de execução atual.");
  }

  return alerts;
}

function buildTrends(
  modifiers: ReturnType<typeof deriveGrowthModifiers>,
  input: ExecutiveForecastInput,
): ForecastTrend[] {
  const growthDirection =
    modifiers.net > 5 ? "up" : modifiers.net < -3 ? "down" : "stable";
  const opsDirection =
    (input.monitoring?.progress.delayRisk ?? 0) >= 50 ? "down" : "stable";

  return [
    {
      metric: "Receita",
      direction: growthDirection,
      value: growthDirection === "up" ? "Em expansão" : growthDirection === "down" ? "Sob pressão" : "Estável",
      change: formatPercent(modifiers.net),
    },
    {
      metric: "Crescimento",
      direction: growthDirection,
      value: formatPercent(10 + modifiers.net),
      change: "vs. baseline anual",
    },
    {
      metric: "Leads",
      direction: modifiers.strengthCount >= 2 ? "up" : "stable",
      value: `${Math.round(186 * (1 + modifiers.net / 100))}`,
      change: formatPercent(modifiers.net / 2),
    },
    {
      metric: "Conversões",
      direction: (input.intelligence?.weaknesses.length ?? 0) > 2 ? "down" : "up",
      value: `${(1.2 + modifiers.net / 50).toFixed(1)}%`,
      change: "projeção 90 dias",
    },
    {
      metric: "Marketing",
      direction:
        (input.decisions?.filter((d) => d.impact === "Marketing").length ?? 0) > 0
          ? "up"
          : "stable",
      value: "Em otimização",
      change: "ROI projetado 2,8x",
    },
    {
      metric: "Operação",
      direction: opsDirection,
      value: opsDirection === "down" ? "Gargalos" : "Adequada",
      change: `Risco ${input.monitoring?.progress.delayRisk ?? 0}%`,
    },
  ];
}

function buildPredictions(
  baseMonthly: number,
  modifiers: ReturnType<typeof deriveGrowthModifiers>,
  input: ExecutiveForecastInput,
) {
  const growthRate = Math.max(0.02, 0.1 + modifiers.net / 100);
  const annualRevenue = projectRevenue(baseMonthly, growthRate, 12);

  return {
    revenue: formatCurrency(annualRevenue),
    growth: formatPercent(growthRate * 100),
    cashFlow: formatCurrency(annualRevenue * 0.28),
    leads: `${Math.round(186 * (1 + growthRate))} / trimestre`,
    conversions: `${(1.2 * (1 + growthRate * 0.4)).toFixed(1)}%`,
    marketing: `ROI ${SCENARIO_MULTIPLIERS.expected.roi}x · ${input.decisions?.filter((d) => d.impact === "Marketing").length ?? 0} iniciativa(s)`,
    operationalPerformance:
      (input.monitoring?.progress.delayRisk ?? 0) >= 50
        ? "Pressão operacional — execução abaixo do ideal"
        : "Capacidade operacional adequada para crescimento moderado",
    bottlenecks: input.monitoring?.bottlenecks.slice(0, 4) ?? [
      "Nenhum gargalo crítico projetado",
    ],
    customerChurn:
      (input.intelligence?.weaknesses.length ?? 0) >= 3
        ? "8–12% — risco elevado por gaps de posicionamento"
        : "4–6% — dentro da média do segmento",
    financialRisk:
      modifiers.delayPenalty >= 30
        ? "Alto — fluxo de caixa sensível a atrasos"
        : modifiers.weaknessCount >= 3
          ? "Moderado — margem exposta a ineficiências"
          : "Baixo — estrutura financeira estável no cenário esperado",
  };
}

export function buildExecutiveForecast(
  input: ExecutiveForecastInput = {},
): ExecutiveForecast | null {
  const hasData =
    input.context ||
    input.intelligence ||
    input.monitoring ||
    input.learning ||
    (input.decisions?.length ?? 0) > 0;

  if (!hasData) return null;

  const baseMonthly = deriveBaseMonthlyRevenue(input.context);
  const modifiers = deriveGrowthModifiers(input);
  const scenarios = buildScenarios(baseMonthly, modifiers, input);
  const expectedScenario =
    scenarios.find((scenario) => scenario.type === "expected") ?? scenarios[1];

  return {
    scenarios,
    timelines: buildTimelines(baseMonthly, modifiers),
    confidence: buildConfidence(input),
    recommendations: buildRecommendations(input),
    futureAlerts: buildFutureAlerts(input),
    expectedGrowth: formatPercent(10 + modifiers.net),
    successProbability: expectedScenario?.probability ?? 62,
    trends: buildTrends(modifiers, input),
    predictions: buildPredictions(baseMonthly, modifiers, input),
  };
}
