import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ExecutiveCompetitor } from "./executive-competitor.service";
import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutionPlan } from "./executive-execution-planner.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveLearning } from "./executive-learning.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";

export type GrowthPlan = {
  horizon: "30d" | "90d" | "365d";
  summary: string;
  goals: string[];
  actions: string[];
  kpis: string[];
};

export type AreaStrategy = {
  summary: string;
  focus: string[];
  actions: string[];
  kpis: string[];
};

export type ExecutiveStrategy = {
  executiveStrategy: string;
  strategicVision: string;
  mission: string;
  positioning: string;
  differentiation: string[];
  growthPlan30d: GrowthPlan;
  growthPlan90d: GrowthPlan;
  growthPlan365d: GrowthPlan;
  commercialStrategy: AreaStrategy;
  marketingStrategy: AreaStrategy;
  financialStrategy: AreaStrategy;
  operationalStrategy: AreaStrategy;
  productStrategy: AreaStrategy;
  expansionStrategy: AreaStrategy;
  topPriorities: string[];
  executiveScore: number;
  confidenceScore: number;
};

export type ExecutiveStrategyInput = {
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  monitoring?: ExecutiveMonitoring | null;
  learning?: ExecutiveLearning | null;
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
};

function buildGrowthPlan30d(input: ExecutiveStrategyInput): GrowthPlan {
  const goals: string[] = [];
  const actions: string[] = [];

  for (const bottleneck of input.monitoring?.bottlenecks.slice(0, 2) ?? []) {
    goals.push(bottleneck);
  }

  for (const alert of input.monitoring?.alerts.slice(0, 1) ?? []) {
    goals.push(alert.title);
    actions.push(alert.message);
  }

  for (const step of input.executionPlans?.[0]?.nextSteps.slice(0, 3) ?? []) {
    actions.push(step);
  }

  if (goals.length === 0) {
    goals.push("Estabilizar base executiva e indicadores iniciais");
  }

  if (actions.length === 0) {
    actions.push("Consolidar contexto, memória e primeiros KPIs de execução");
  }

  return {
    horizon: "30d",
    summary:
      "Fase de estabilização: desbloquear gargalos, mitigar alertas e iniciar execução imediata.",
    goals: goals.slice(0, 4),
    actions: actions.slice(0, 5),
    kpis: [
      "Entregas concluídas em 30 dias",
      "Risco de atraso",
      "Alertas mitigados",
      "Score executivo",
    ],
  };
}

function buildGrowthPlan90d(input: ExecutiveStrategyInput): GrowthPlan {
  const goals = [
    ...(input.intelligence?.priorities.slice(0, 3) ?? []),
    ...(input.intelligence?.opportunities.slice(0, 1) ?? []),
  ];

  const actions = [
    ...(input.decisions?.filter((d) => d.priority === "Critical").slice(0, 2).map((d) => d.title) ?? []),
    ...(input.competitor?.recommendations.slice(0, 1).map((r) => r.title) ?? []),
    ...(input.executionPlans?.[0]?.nextSteps.slice(0, 2) ?? []),
  ];

  if (goals.length === 0) {
    goals.push("Converter inteligência em decisões críticas executadas");
  }

  if (actions.length === 0) {
    actions.push("Ativar planos de execução com monitoramento semanal");
  }

  return {
    horizon: "90d",
    summary:
      "Fase de aceleração: priorizar decisões críticas e capturar oportunidades de curto prazo.",
    goals: goals.slice(0, 5),
    actions: actions.slice(0, 5),
    kpis: [
      "Decisões críticas concluídas",
      "Taxa de conversão",
      "Pipeline qualificado",
      "KPIs trimestrais",
    ],
  };
}

function buildGrowthPlan365d(input: ExecutiveStrategyInput): GrowthPlan {
  const goals = [
    ...(input.forecast?.recommendations.slice(0, 2).map((r) => r.title) ?? []),
    ...(input.learning?.permanentRecommendations.slice(0, 2) ?? []),
    ...(input.competitor?.marketGaps
      .filter((g) => g.priority === "critical" || g.priority === "high")
      .slice(0, 1)
      .map((g) => `Fechar gap: ${g.area}`) ?? []),
  ];

  const actions = [
    ...(input.forecast?.recommendations.slice(0, 2).map((r) => r.description) ?? []),
    ...(input.competitor?.recommendations
      .filter((r) => r.priority === "high" || r.priority === "critical")
      .slice(0, 2)
      .map((r) => r.title) ?? []),
  ];

  if (goals.length === 0) {
    goals.push(
      `Escalar crescimento sustentável (${input.forecast?.expectedGrowth ?? "+10%"})`,
    );
  }

  if (actions.length === 0) {
    actions.push("Institucionalizar aprendizados e expandir vantagens competitivas");
  }

  return {
    horizon: "365d",
    summary:
      "Fase de escala: consolidar crescimento, fechar gaps competitivos e expandir mercado.",
    goals: goals.slice(0, 5),
    actions: actions.slice(0, 5),
    kpis: [
      "Crescimento anual",
      "Market share",
      "LTV / CAC",
      "Score de evolução",
    ],
  };
}

function buildCommercialStrategy(input: ExecutiveStrategyInput): AreaStrategy {
  const segment =
    input.context?.businessProfile?.segment ??
    input.context?.company.industry ??
    "mercado-alvo";

  const revenueDecisions = (input.decisions ?? []).filter(
    (d) => d.impact === "Receita" || d.impact === "Vendas",
  );

  return {
    summary: `Estruturar receita recorrente e conversão no segmento ${segment}.`,
    focus: [
      `Participação: ${input.competitor?.marketShare.companyShare ?? "a definir"}`,
      ...(input.intelligence?.opportunities.slice(0, 2) ?? []),
    ],
    actions: [
      ...(revenueDecisions.slice(0, 2).map((d) => d.title) ?? []),
      ...(input.competitor?.recommendations.slice(0, 1).map((r) => r.title) ?? []),
      "Revisar funil comercial mensalmente",
    ],
    kpis: ["Receita", "Taxa de conversão", "Ticket médio", "Pipeline"],
  };
}

function buildFinancialStrategy(input: ExecutiveStrategyInput): AreaStrategy {
  const expected = input.forecast?.scenarios.find((s) => s.type === "expected");

  return {
    summary:
      "Garantir saúde financeira com cenários integrados ao forecast executivo.",
    focus: [
      `Receita esperada: ${expected?.projectedRevenue ?? input.forecast?.predictions.revenue ?? "a definir"}`,
      `Fluxo de caixa: ${input.forecast?.predictions.cashFlow ?? "positivo"}`,
    ],
    actions: [
      ...(input.forecast?.recommendations
        .filter((r) => r.priority === "critical")
        .slice(0, 2)
        .map((r) => r.title) ?? []),
      "Monitorar risco financeiro semanalmente",
    ],
    kpis: ["ROI", "Margem operacional", "Burn rate", "CAC"],
  };
}

function buildMarketingStrategy(input: ExecutiveStrategyInput): AreaStrategy {
  const positioning =
    input.context?.businessProfile?.positioning ?? "posicionamento diferenciado";

  return {
    summary: `Fortalecer marca e demanda com foco em ${positioning}.`,
    focus: [
      ...(input.intelligence?.strengths.slice(0, 2) ?? []),
      ...(input.competitor?.opportunities.slice(0, 1).map((o) => o.title) ?? []),
    ],
    actions: [
      ...(input.decisions?.filter((d) => d.impact === "Marketing").slice(0, 2).map((d) => d.title) ?? []),
      `Preço: ${input.competitor?.pricePosition.companyPosition ?? "competitivo"}`,
    ],
    kpis: ["Leads qualificados", "CPL", "Engajamento", "Share of voice"],
  };
}

function buildProductStrategy(input: ExecutiveStrategyInput): AreaStrategy {
  return {
    summary: "Evoluir oferta com diferenciais defensáveis e valor percebido superior.",
    focus: [
      ...(input.context?.businessProfile?.differentiators
        ? [String(input.context.businessProfile.differentiators)]
        : []),
      ...(input.competitor?.marketGaps.slice(0, 2).map((g) => g.area) ?? []),
    ],
    actions: [
      ...(input.learning?.bestPractices.slice(0, 2) ?? []),
      "Roadmap trimestral validado com inteligência competitiva",
    ],
    kpis: ["NPS", "Adoção", "Time-to-value", "Retenção"],
  };
}

function buildOperationalStrategy(input: ExecutiveStrategyInput): AreaStrategy {
  return {
    summary: "Converter decisões em execução monitorada com baixo risco de atraso.",
    focus: [
      `${input.executionPlans?.length ?? 0} plano(s) ativo(s)`,
      `Risco de atraso: ${input.monitoring?.progress.delayRisk ?? 0}%`,
    ],
    actions: [
      ...(input.executionPlans?.[0]?.nextSteps.slice(0, 3) ?? []),
      ...(input.monitoring?.bottlenecks.slice(0, 1) ?? []),
    ],
    kpis: ["Entrega no prazo", "Eficiência", "Milestones concluídos"],
  };
}

function buildExpansionStrategy(input: ExecutiveStrategyInput): AreaStrategy {
  const companyName = input.context?.company.name ?? "Empresa";

  return {
    summary: `Expandir presença e receita de ${companyName} com inteligência competitiva.`,
    focus: [
      ...(input.competitor?.opportunities.slice(0, 2).map((o) => o.description) ?? []),
      "Novos segmentos com fit validado",
    ],
    actions: [
      ...(input.competitor?.recommendations
        .filter((r) => r.priority === "high" || r.priority === "critical")
        .slice(0, 2)
        .map((r) => r.title) ?? []),
      "Pilotos controlados com critérios go/no-go",
    ],
    kpis: ["Receita novos mercados", "Tempo de entrada", "ROI expansão"],
  };
}

function buildDifferentiation(input: ExecutiveStrategyInput): string[] {
  const items: string[] = [];

  if (input.context?.businessProfile?.differentiators) {
    const diff = input.context.businessProfile.differentiators;
    items.push(...(Array.isArray(diff) ? diff : [String(diff)]));
  }

  for (const strength of input.intelligence?.strengths.slice(0, 3) ?? []) {
    items.push(strength);
  }

  for (const gap of input.competitor?.marketGaps.slice(0, 2) ?? []) {
    items.push(`Gap explorável: ${gap.area} — ${gap.gap}`);
  }

  for (const practice of input.learning?.bestPractices.slice(0, 1) ?? []) {
    items.push(practice);
  }

  if (items.length === 0) {
    items.push(
      "Inteligência executiva integrada (contexto + memória + forecast)",
      "Decisões orientadas por dados e monitoramento contínuo",
    );
  }

  return [...new Set(items)].slice(0, 8);
}

function buildTopPriorities(input: ExecutiveStrategyInput): string[] {
  return [
    ...(input.intelligence?.priorities ?? []),
    ...(input.monitoring?.bottlenecks ?? []),
    ...(input.decisions?.filter((d) => d.priority === "Critical").map((d) => d.title) ?? []),
    ...(input.competitor?.recommendations
      .filter((r) => r.priority === "critical")
      .map((r) => r.title) ?? []),
    ...(input.learning?.permanentRecommendations ?? []),
  ]
    .filter(Boolean)
    .slice(0, 8);
}

function calculateExecutiveScore(input: ExecutiveStrategyInput): number {
  let score = 25;

  score += Math.min(12, (input.intelligence?.strengths.length ?? 0) * 3);
  score += Math.min(10, (input.decisions?.length ?? 0) * 2);
  score += Math.min(10, (input.executionPlans?.length ?? 0) * 2);
  score += Math.min(8, (input.learning?.evolutionScore ?? 0) * 0.08);
  score += Math.min(8, (input.forecast?.successProbability ?? 0) * 0.08);
  score += Math.min(8, (input.context?.memories.length ?? 0) * 2);
  score += Math.min(8, (input.competitor?.recommendations.length ?? 0) * 2);

  score -= Math.min(15, (input.intelligence?.weaknesses.length ?? 0) * 2);
  score -= Math.min(
    10,
    Math.round((input.monitoring?.progress.delayRisk ?? 0) * 0.1),
  );
  score -= Math.min(
    8,
    (input.competitor?.threats.filter((t) => t.severity === "critical").length ??
      0) * 3,
  );

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateConfidenceScore(input: ExecutiveStrategyInput): number {
  let score = 20;

  if (input.context) score += 15;
  if (input.intelligence) score += 12;
  if ((input.decisions?.length ?? 0) > 0) score += 10;
  if ((input.executionPlans?.length ?? 0) > 0) score += 10;
  if (input.monitoring) score += 8;
  if (input.learning) score += 8;
  if (input.forecast) {
    score += Math.min(10, (input.forecast.confidence.overall ?? 0) * 0.1);
  }
  if (input.competitor) score += 10;

  score -= Math.min(12, (input.intelligence?.risks.length ?? 0) * 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildExecutiveStrategyText(
  input: ExecutiveStrategyInput,
  executiveScore: number,
): string {
  const company = input.context?.company.name ?? "A empresa";
  const segment =
    input.context?.businessProfile?.segment ??
    input.context?.company.industry ??
    "seu mercado";

  const maturity =
    executiveScore >= 75
      ? "escala orientada por dados"
      : executiveScore >= 55
        ? "crescimento estruturado"
        : executiveScore >= 35
          ? "consolidação operacional"
          : "fundação estratégica";

  const competitiveContext = input.competitor?.executiveSummary
    ? ` ${input.competitor.executiveSummary}`
    : "";

  return `${company} adota estratégia de ${maturity} no segmento ${segment}, integrando contexto, inteligência, decisões, execução, monitoramento, aprendizado, forecast e inteligência competitiva (Executive Score ${executiveScore}/100).${competitiveContext}`;
}

function buildStrategicVision(input: ExecutiveStrategyInput): string {
  const company = input.context?.company.name ?? "A empresa";
  const growth = input.forecast?.expectedGrowth ?? "+10%";
  const probability = input.forecast?.successProbability ?? 0;

  return `${company} projeta liderança sustentável com crescimento de ${growth} e probabilidade de sucesso de ${probability}%, consolidando diferenciais competitivos e expandindo participação de mercado (${input.competitor?.marketShare.companyShare ?? "meta a definir"}).`;
}

function buildMission(input: ExecutiveStrategyInput): string {
  const company = input.context?.company.name ?? "A organização";

  if (input.context?.businessProfile?.mission) {
    return `${company}: ${input.context.businessProfile.mission}`;
  }

  const value =
    input.context?.businessProfile?.value_proposition ??
    input.context?.summary ??
    "entregar valor superior ao mercado";

  return `${company} existe para ${value}, convertendo inteligência executiva em resultados mensuráveis.`;
}

function buildPositioning(input: ExecutiveStrategyInput): string {
  const profilePositioning = input.context?.businessProfile?.positioning;
  if (profilePositioning) return profilePositioning;

  const competitorPosition = input.competitor?.pricePosition.companyPosition;
  if (competitorPosition) {
    return `Posicionamento ${competitorPosition} com foco em inteligência executiva integrada`;
  }

  return input.intelligence?.executiveSummary ?? "Posicionamento estratégico em consolidação";
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
    input.competitor ||
    (input.decisions?.length ?? 0) > 0;

  if (!hasData) return null;

  const executiveScore = calculateExecutiveScore(input);
  const confidenceScore = calculateConfidenceScore(input);

  return {
    executiveStrategy: buildExecutiveStrategyText(input, executiveScore),
    strategicVision: buildStrategicVision(input),
    mission: buildMission(input),
    positioning: buildPositioning(input),
    differentiation: buildDifferentiation(input),
    growthPlan30d: buildGrowthPlan30d(input),
    growthPlan90d: buildGrowthPlan90d(input),
    growthPlan365d: buildGrowthPlan365d(input),
    commercialStrategy: buildCommercialStrategy(input),
    marketingStrategy: buildMarketingStrategy(input),
    financialStrategy: buildFinancialStrategy(input),
    operationalStrategy: buildOperationalStrategy(input),
    productStrategy: buildProductStrategy(input),
    expansionStrategy: buildExpansionStrategy(input),
    topPriorities: buildTopPriorities(input),
    executiveScore,
    confidenceScore,
  };
}
