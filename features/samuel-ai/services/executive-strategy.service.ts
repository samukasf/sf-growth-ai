import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ExecutiveCompetitor } from "./executive-competitor.service";
import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutionPlan } from "./executive-execution-planner.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveLearning } from "./executive-learning.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";

export type StrategicObjective = {
  id: string;
  title: string;
  description: string;
  metric: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type StrategicObjectivesByHorizon = {
  days30: StrategicObjective[];
  days90: StrategicObjective[];
  days365: StrategicObjective[];
};

export type StrategicPlan = {
  id: string;
  title: string;
  summary: string;
  goals: string[];
  actions: string[];
  kpis: string[];
  horizon: string;
};

export type ExecutiveStrategy = {
  mainStrategy: string;
  objectives: StrategicObjectivesByHorizon;
  operationalMission: string;
  commercialPlan: StrategicPlan;
  financialPlan: StrategicPlan;
  marketingPlan: StrategicPlan;
  productPlan: StrategicPlan;
  operationsPlan: StrategicPlan;
  growthPlan: StrategicPlan;
  expansionPlan: StrategicPlan;
  competitiveDifferentiators: string[];
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

function buildObjectives30(input: ExecutiveStrategyInput): StrategicObjective[] {
  const objectives: StrategicObjective[] = [];
  let index = 0;

  for (const bottleneck of input.monitoring?.bottlenecks.slice(0, 2) ?? []) {
    objectives.push({
      id: `obj-30-${index++}`,
      title: bottleneck.split(/[.—]/)[0]?.trim() ?? "Desbloqueio operacional",
      description: bottleneck,
      metric: "Resolvido em até 30 dias",
      priority: "critical",
    });
  }

  for (const alert of input.monitoring?.alerts.slice(0, 1) ?? []) {
    objectives.push({
      id: `obj-30-${index++}`,
      title: alert.title,
      description: alert.message,
      metric: "Mitigação em 30 dias",
      priority: alert.severity === "critical" ? "critical" : "high",
    });
  }

  for (const step of input.executionPlans?.[0]?.nextSteps.slice(0, 2) ?? []) {
    objectives.push({
      id: `obj-30-${index++}`,
      title: step.split(/[.—]/)[0]?.trim() ?? "Ação imediata",
      description: step,
      metric: "Conclusão em 30 dias",
      priority: "high",
    });
  }

  if (objectives.length === 0) {
    objectives.push({
      id: "obj-30-default",
      title: "Estabilizar base executiva",
      description:
        "Consolidar contexto, memória e primeiros indicadores de execução.",
      metric: "Score executivo ≥ 50",
      priority: "high",
    });
  }

  return objectives.slice(0, 5);
}

function buildObjectives90(input: ExecutiveStrategyInput): StrategicObjective[] {
  const objectives: StrategicObjective[] = [];
  let index = 0;

  for (const priority of input.intelligence?.priorities.slice(0, 3) ?? []) {
    objectives.push({
      id: `obj-90-${index++}`,
      title: priority.split(/[.—]/)[0]?.trim() ?? priority,
      description: priority,
      metric: "Conclusão em 90 dias",
      priority: "critical",
    });
  }

  for (const decision of input.decisions?.filter((d) => d.priority === "Critical").slice(0, 2) ?? []) {
    objectives.push({
      id: `obj-90-${index++}`,
      title: decision.title,
      description: decision.description,
      metric: decision.estimatedROI,
      priority: "high",
    });
  }

  for (const rec of input.competitor?.recommendations.slice(0, 1) ?? []) {
    objectives.push({
      id: `obj-90-${index++}`,
      title: rec.title,
      description: rec.description,
      metric: "Implementação em 90 dias",
      priority: rec.priority,
    });
  }

  if (objectives.length === 0) {
    objectives.push({
      id: "obj-90-default",
      title: "Acelerar decisões críticas",
      description:
        "Converter inteligência em decisões com plano de execução monitorado.",
      metric: "3 decisões críticas executadas",
      priority: "high",
    });
  }

  return objectives.slice(0, 6);
}

function buildObjectives365(input: ExecutiveStrategyInput): StrategicObjective[] {
  const objectives: StrategicObjective[] = [];
  let index = 0;

  for (const rec of input.forecast?.recommendations.slice(0, 2) ?? []) {
    objectives.push({
      id: `obj-365-${index++}`,
      title: rec.title,
      description: rec.description,
      metric: rec.horizon,
      priority: rec.priority,
    });
  }

  for (const lesson of input.learning?.permanentRecommendations.slice(0, 2) ?? []) {
    objectives.push({
      id: `obj-365-${index++}`,
      title: lesson.split(/[.—]/)[0]?.trim() ?? "Evolução estratégica",
      description: lesson,
      metric: "Institucionalizado em 365 dias",
      priority: "high",
    });
  }

  for (const gap of input.competitor?.marketGaps.filter((g) => g.priority === "critical" || g.priority === "high").slice(0, 1) ?? []) {
    objectives.push({
      id: `obj-365-${index++}`,
      title: `Fechar gap: ${gap.area}`,
      description: gap.gap,
      metric: "Posição competitiva elevada",
      priority: gap.priority,
    });
  }

  if (objectives.length === 0) {
    objectives.push({
      id: "obj-365-default",
      title: "Escalar vantagem competitiva",
      description:
        "Consolidar crescimento, marca e execução com base em aprendizado contínuo.",
      metric: `Crescimento ${input.forecast?.expectedGrowth ?? "+10%"}`,
      priority: "high",
    });
  }

  return objectives.slice(0, 6);
}

function buildPlan(
  id: string,
  title: string,
  summary: string,
  goals: string[],
  actions: string[],
  kpis: string[],
  horizon: string,
): StrategicPlan {
  return { id, title, summary, goals, actions, kpis, horizon };
}

function buildCommercialPlan(input: ExecutiveStrategyInput): StrategicPlan {
  const segment =
    input.context?.businessProfile?.segment ??
    input.context?.company.industry ??
    "mercado-alvo";

  const revenueDecisions = (input.decisions ?? []).filter(
    (d) => d.impact === "Receita" || d.impact === "Vendas",
  );

  return buildPlan(
    "plan-commercial",
    "Plano Comercial",
    `Estruturar receita recorrente e conversão no segmento ${segment}, alinhado ao posicionamento competitivo.`,
    [
      `Capturar oportunidades em ${segment}`,
      `Participação de mercado: ${input.competitor?.marketShare.companyShare ?? "a definir"}`,
      ...(input.intelligence?.opportunities.slice(0, 2) ?? []),
    ],
    [
      ...(revenueDecisions.slice(0, 2).map((d) => d.title) ?? []),
      ...(input.competitor?.recommendations.slice(0, 1).map((r) => r.title) ?? []),
      "Revisar funil comercial e taxa de conversão mensalmente",
    ],
    [
      "Receita projetada",
      "Taxa de conversão",
      "Ticket médio",
      "Pipeline qualificado",
    ],
    "90–365 dias",
  );
}

function buildFinancialPlan(input: ExecutiveStrategyInput): StrategicPlan {
  const expected = input.forecast?.scenarios.find((s) => s.type === "expected");

  return buildPlan(
    "plan-financial",
    "Plano Financeiro",
    "Garantir saúde financeira com cenários conservador, esperado e agressivo integrados ao forecast.",
    [
      `Receita esperada: ${expected?.projectedRevenue ?? input.forecast?.predictions.revenue ?? "a definir"}`,
      `Fluxo de caixa: ${input.forecast?.predictions.cashFlow ?? "positivo"}`,
      "Margem protegida contra riscos operacionais",
    ],
    [
      ...(input.forecast?.recommendations.filter((r) => r.priority === "critical").slice(0, 2).map((r) => r.title) ?? []),
      "Monitorar risco financeiro semanalmente",
      "Reservar buffer para iniciativas de alto impacto",
    ],
    [
      "ROI por iniciativa",
      "Margem operacional",
      "Burn rate / runway",
      "Custo de aquisição (CAC)",
    ],
    "365 dias",
  );
}

function buildMarketingPlan(input: ExecutiveStrategyInput): StrategicPlan {
  const positioning =
    input.context?.businessProfile?.positioning ?? "posicionamento diferenciado";

  return buildPlan(
    "plan-marketing",
    "Plano de Marketing",
    `Fortalecer marca e demanda com foco em ${positioning}.`,
    [
      "Autoridade e reconhecimento no segmento",
      ...(input.intelligence?.strengths.slice(0, 2) ?? []),
      ...(input.competitor?.opportunities.slice(0, 1).map((o) => o.title) ?? []),
    ],
    [
      ...(input.decisions?.filter((d) => d.impact === "Marketing").slice(0, 2).map((d) => d.title) ?? []),
      `Posicionamento de preço: ${input.competitor?.pricePosition.companyPosition ?? "competitivo"}`,
      "Campanhas orientadas por gaps de mercado identificados",
    ],
    [
      "Leads qualificados",
      "Custo por lead (CPL)",
      "Engajamento digital",
      "Share of voice",
    ],
    "90–365 dias",
  );
}

function buildProductPlan(input: ExecutiveStrategyInput): StrategicPlan {
  return buildPlan(
    "plan-product",
    "Plano de Produto",
    "Evoluir oferta com diferenciais defensáveis e valor percebido superior.",
    [
      ...(input.context?.businessProfile?.differentiators
        ? [String(input.context.businessProfile.differentiators)]
        : []),
      ...(input.competitor?.marketGaps.slice(0, 2).map((g) => g.area) ?? []),
      "Experiência do cliente como vantagem competitiva",
    ],
    [
      ...(input.learning?.bestPractices.slice(0, 2) ?? []),
      "Roadmap trimestral validado com inteligência competitiva",
      "Priorizar features de alto impacto × baixo esforço",
    ],
    [
      "NPS / satisfação",
      "Adoção de funcionalidades",
      "Time-to-value",
      "Retenção de clientes",
    ],
    "90–365 dias",
  );
}

function buildOperationsPlan(input: ExecutiveStrategyInput): StrategicPlan {
  return buildPlan(
    "plan-operations",
    "Plano de Operações",
    "Converter decisões em execução monitorada com baixo risco de atraso.",
    [
      `${input.executionPlans?.length ?? 0} plano(s) de execução ativo(s)`,
      `Risco de atraso: ${input.monitoring?.progress.delayRisk ?? 0}%`,
      "Processos repetíveis e auditáveis",
    ],
    [
      ...(input.executionPlans?.[0]?.nextSteps.slice(0, 3) ?? []),
      ...(input.monitoring?.bottlenecks.slice(0, 1) ?? []),
      "Rituais semanais de acompanhamento de KPIs",
    ],
    [
      "Entrega no prazo",
      "Eficiência operacional",
      "Produtividade por equipe",
      "Taxa de conclusão de milestones",
    ],
    "30–365 dias",
  );
}

function buildGrowthPlan(input: ExecutiveStrategyInput): StrategicPlan {
  return buildPlan(
    "plan-growth",
    "Plano de Crescimento",
    `Acelerar crescimento sustentável com meta de ${input.forecast?.expectedGrowth ?? "+10%"}.`,
    [
      `Probabilidade de sucesso: ${input.forecast?.successProbability ?? 0}%`,
      ...(input.intelligence?.opportunities.slice(0, 2) ?? []),
      "Escalar canais com melhor ROI comprovado",
    ],
    [
      ...(input.forecast?.recommendations.slice(0, 2).map((r) => r.title) ?? []),
      ...(input.decisions?.filter((d) => d.impact === "Receita").slice(0, 1).map((d) => d.title) ?? []),
      "Testar hipóteses de crescimento em ciclos de 30 dias",
    ],
    [
      "Taxa de crescimento (MoM/QoQ)",
      "Novos clientes",
      "Expansão de receita (upsell)",
      "LTV / CAC",
    ],
    "90–365 dias",
  );
}

function buildExpansionPlan(input: ExecutiveStrategyInput): StrategicPlan {
  const companyName = input.context?.company.name ?? "Empresa";

  return buildPlan(
    "plan-expansion",
    "Plano de Expansão",
    `Expandir presença e receita de ${companyName} com base em inteligência competitiva.`,
    [
      ...(input.competitor?.opportunities.slice(0, 2).map((o) => o.description) ?? []),
      "Novos segmentos ou geografias com fit validado",
      "Parcerias estratégicas de distribuição",
    ],
    [
      ...(input.competitor?.recommendations.filter((r) => r.priority === "high" || r.priority === "critical").slice(0, 2).map((r) => r.title) ?? []),
      "Mapear ameaças competitivas antes de escalar",
      "Pilotos controlados com critérios de go/no-go",
    ],
    [
      "Receita de novos mercados",
      "Tempo de entrada",
      "Market share regional",
      "ROI de expansão",
    ],
    "365 dias",
  );
}

function buildDifferentiators(input: ExecutiveStrategyInput): string[] {
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
    ...(input.competitor?.recommendations.filter((r) => r.priority === "critical").map((r) => r.title) ?? []),
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
  score -= Math.min(10, Math.round((input.monitoring?.progress.delayRisk ?? 0) * 0.1));
  score -= Math.min(8, (input.competitor?.threats.filter((t) => t.severity === "critical").length ?? 0) * 3);

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
  if (input.forecast) score += Math.min(10, (input.forecast.confidence.overall ?? 0) * 0.1);
  if (input.competitor) score += 10;

  score -= Math.min(12, (input.intelligence?.risks.length ?? 0) * 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildMainStrategy(
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

  return `${company} adota estratégia de ${maturity} no segmento ${segment}, consolidando contexto, inteligência, decisões, execução, monitoramento, aprendizado, forecast e inteligência competitiva em um plano unificado (Executive Score ${executiveScore}/100).${competitiveContext}`;
}

function buildOperationalMission(input: ExecutiveStrategyInput): string {
  const company = input.context?.company.name ?? "A organização";
  const positioning =
    input.context?.businessProfile?.positioning ??
    "entregar valor superior ao mercado";

  return `${company} opera com missão de ${positioning}, convertendo insights executivos em ações mensuráveis, reduzindo riscos (${input.monitoring?.progress.delayRisk ?? 0}% de atraso) e maximizando oportunidades identificadas pelo motor estratégico.`;
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
    mainStrategy: buildMainStrategy(input, executiveScore),
    objectives: {
      days30: buildObjectives30(input),
      days90: buildObjectives90(input),
      days365: buildObjectives365(input),
    },
    operationalMission: buildOperationalMission(input),
    commercialPlan: buildCommercialPlan(input),
    financialPlan: buildFinancialPlan(input),
    marketingPlan: buildMarketingPlan(input),
    productPlan: buildProductPlan(input),
    operationsPlan: buildOperationsPlan(input),
    growthPlan: buildGrowthPlan(input),
    expansionPlan: buildExpansionPlan(input),
    competitiveDifferentiators: buildDifferentiators(input),
    topPriorities: buildTopPriorities(input),
    executiveScore,
    confidenceScore,
  };
}
