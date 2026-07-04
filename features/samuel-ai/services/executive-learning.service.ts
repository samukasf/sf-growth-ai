import type { ExecutiveContext } from "@/services/executive-context.service";
import type { CompanyMemoryRecord } from "@/services/executive-memory.service";

import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutionPlan } from "./executive-execution-planner.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveMonitoring } from "./executive-monitoring.service";

export type InsightCategory =
  | "success"
  | "failure"
  | "opportunity"
  | "risk"
  | "pattern";

export type PatternType =
  | "winning_decision"
  | "failed_decision"
  | "recurring_campaign"
  | "waste"
  | "bottleneck"
  | "seasonality"
  | "growth"
  | "behavior_change";

export type ExecutiveInsight = {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  confidence: number;
  source: string;
};

export type LearningPattern = {
  id: string;
  type: PatternType;
  title: string;
  description: string;
  frequency: number;
  impact: "high" | "medium" | "low";
};

export type LearningRule = {
  id: string;
  title: string;
  rule: string;
  rationale: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type ExecutiveExperience = {
  id: string;
  title: string;
  description: string;
  outcome: "success" | "failure" | "neutral" | "pending";
  department: string;
  learnedAt: string;
};

export type ExecutiveEvolution = {
  currentLevel: number;
  previousLevel: number;
  trajectory: "ascending" | "stable" | "declining";
  strategicMaturity: string;
  summary: string;
};

export type ImprovementMilestone = {
  date: string;
  milestone: string;
  scoreDelta: number;
};

export type ExecutiveLearning = {
  insights: ExecutiveInsight[];
  patterns: LearningPattern[];
  rules: LearningRule[];
  experiences: ExecutiveExperience[];
  evolution: ExecutiveEvolution;
  lessonsLearned: string[];
  bestPractices: string[];
  permanentRecommendations: string[];
  improvementHistory: ImprovementMilestone[];
  evolutionScore: number;
};

export type ExecutiveLearningInput = {
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  executionPlans?: ExecutionPlan[];
  monitoring?: ExecutiveMonitoring | null;
};

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isSuccessMemory(memory: CompanyMemoryRecord) {
  const category = normalizeText(memory.category);
  const content = normalizeText(
    typeof memory.content === "string" ? memory.content : JSON.stringify(memory.content),
  );

  return (
    category.includes("result") ||
    category.includes("aprend") ||
    content.includes("roi") ||
    content.includes("sucesso") ||
    content.includes("reativ")
  );
}

function isFailureSignal(text: string) {
  const normalized = normalizeText(text);
  return (
    normalized.includes("falha") ||
    normalized.includes("queda") ||
    normalized.includes("atras") ||
    normalized.includes("dispers") ||
    normalized.includes("ausencia") ||
    normalized.includes("ausência") ||
    normalized.includes("nao definido") ||
    normalized.includes("não definido")
  );
}

function buildMemoryInsights(memories: CompanyMemoryRecord[]): ExecutiveInsight[] {
  return memories.slice(0, 6).map((memory) => ({
    id: `insight-memory-${memory.id}`,
    title: memory.title,
    description:
      typeof memory.content === "string"
        ? memory.content
        : JSON.stringify(memory.content),
    category: isSuccessMemory(memory) ? ("success" as const) : ("pattern" as const),
    confidence: Math.min(
      95,
      60 +
        (typeof memory.importance === "number"
          ? memory.importance
          : Number.parseInt(String(memory.importance), 10) || 5) *
          3,
    ),
    source: `Memória · ${memory.category}`,
  }));
}

function buildInsights(
  input: ExecutiveLearningInput,
): ExecutiveInsight[] {
  const insights: ExecutiveInsight[] = [];
  let index = 0;

  if (input.context?.memories.length) {
    insights.push(...buildMemoryInsights(input.context.memories));
  }

  for (const strength of input.intelligence?.strengths ?? []) {
    insights.push({
      id: `insight-strength-${index++}`,
      title: "Força estratégica confirmada",
      description: strength,
      category: "success",
      confidence: 78,
      source: "Executive Intelligence",
    });
  }

  for (const weakness of input.intelligence?.weaknesses ?? []) {
    insights.push({
      id: `insight-weakness-${index++}`,
      title: "Gap estratégico identificado",
      description: weakness,
      category: isFailureSignal(weakness) ? "failure" : "risk",
      confidence: 82,
      source: "Executive Intelligence",
    });
  }

  for (const opportunity of input.intelligence?.opportunities ?? []) {
    insights.push({
      id: `insight-opportunity-${index++}`,
      title: "Oportunidade recorrente",
      description: opportunity,
      category: "opportunity",
      confidence: 74,
      source: "Executive Intelligence",
    });
  }

  for (const alert of input.monitoring?.alerts.slice(0, 3) ?? []) {
    insights.push({
      id: `insight-alert-${index++}`,
      title: alert.title,
      description: alert.message,
      category: "risk",
      confidence: 88,
      source: "Executive Monitoring",
    });
  }

  return insights.slice(0, 12);
}

function buildPatterns(input: ExecutiveLearningInput): LearningPattern[] {
  const patterns: LearningPattern[] = [];
  let index = 0;

  const strengthDecisions =
    input.decisions?.filter((decision) => decision.source === "strength") ?? [];
  if (strengthDecisions.length > 0) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "winning_decision",
      title: "Decisões que funcionam",
      description: `${strengthDecisions.length} decisão(ões) derivada(s) de forças existentes — padrão de capitalização de ativos.`,
      frequency: strengthDecisions.length,
      impact: "high",
    });
  }

  const weaknessDecisions =
    input.decisions?.filter((decision) => decision.source === "weakness") ?? [];
  if (weaknessDecisions.length > 0) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "failed_decision",
      title: "Decisões corretivas recorrentes",
      description: `${weaknessDecisions.length} decisão(ões) endereçam fraquezas estruturais ainda não resolvidas.`,
      frequency: weaknessDecisions.length,
      impact: "high",
    });
  }

  const marketingDecisions =
    input.decisions?.filter((decision) => decision.impact === "Marketing") ?? [];
  if (marketingDecisions.length >= 2) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "recurring_campaign",
      title: "Campanhas e ações de marketing repetidamente priorizadas",
      description:
        "Marketing concentra múltiplas decisões — padrão de demanda por presença e conversão digital.",
      frequency: marketingDecisions.length,
      impact: "medium",
    });
  }

  const notStartedPlans =
    input.executionPlans?.filter((plan) => plan.status === "Not Started").length ?? 0;
  if (notStartedPlans > 0) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "waste",
      title: "Desperdício recorrente de planejamento",
      description: `${notStartedPlans} plano(s) definido(s) sem execução iniciada — energia estratégica sem conversão operacional.`,
      frequency: notStartedPlans,
      impact: "high",
    });
  }

  for (const bottleneck of input.monitoring?.bottlenecks ?? []) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "bottleneck",
      title: "Gargalo frequente",
      description: bottleneck,
      frequency: 1,
      impact: "high",
    });
  }

  if ((input.intelligence?.opportunities.length ?? 0) >= 3) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "seasonality",
      title: "Janelas de oportunidade concentradas",
      description:
        "Múltiplas oportunidades simultâneas sugerem momento favorável para execução coordenada.",
      frequency: input.intelligence!.opportunities.length,
      impact: "medium",
    });
  }

  if ((input.intelligence?.strengths.length ?? 0) >= 3) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "growth",
      title: "Crescimento consistente em maturidade estratégica",
      description:
        "Base sólida de forças indica evolução positiva da inteligência executiva da empresa.",
      frequency: input.intelligence!.strengths.length,
      impact: "medium",
    });
  }

  if ((input.monitoring?.progress.delayRisk ?? 0) >= 50) {
    patterns.push({
      id: `pattern-${index++}`,
      type: "behavior_change",
      title: "Mudança de comportamento necessária",
      description:
        "Alto risco de atraso indica necessidade de mudança operacional imediata na cadência de execução.",
      frequency: 1,
      impact: "high",
    });
  }

  return patterns;
}

function buildRules(input: ExecutiveLearningInput): LearningRule[] {
  const rules: LearningRule[] = [];
  let index = 0;

  if (input.intelligence?.weaknesses.some((w) => normalizeText(w).includes("posicionamento"))) {
    rules.push({
      id: `rule-${index++}`,
      title: "Posicionamento antes de escala",
      rule: "Nenhuma campanha de escala deve ser aprovada sem posicionamento formalizado.",
      rationale: "Fraquezas de posicionamento foram detectadas repetidamente nas análises.",
      priority: "critical",
    });
  }

  if ((input.monitoring?.progress.notStartedPlans ?? 0) > 0) {
    rules.push({
      id: `rule-${index++}`,
      title: "Kickoff obrigatório em 7 dias",
      rule: "Todo plano aprovado deve ter kickoff executivo em até 7 dias.",
      rationale: "Planos parados geram desperdício e elevam risco de atraso.",
      priority: "critical",
    });
  }

  if (input.decisions?.some((d) => d.priority === "Critical")) {
    rules.push({
      id: `rule-${index++}`,
      title: "Prioridade crítica monotarefa",
      rule: "Decisões críticas devem ter no máximo uma iniciativa paralela por departamento.",
      rationale: "Dispersão de esforço reduz taxa de sucesso em decisões críticas.",
      priority: "high",
    });
  }

  if ((input.context?.memories.length ?? 0) > 0) {
    rules.push({
      id: `rule-${index++}`,
      title: "Memória antes de nova decisão",
      rule: "Consultar memórias estratégicas antes de aprovar nova diretriz executiva.",
      rationale: "Memórias existentes aumentam confiança e evitam repetição de erros.",
      priority: "high",
    });
  }

  if (input.monitoring?.alerts.some((a) => a.type === "blocked_dependency")) {
    rules.push({
      id: `rule-${index++}`,
      title: "Dependências explícitas",
      rule: "Etapas com dependência bloqueada devem ser escaladas em 48 horas.",
      rationale: "Dependências bloqueadas são gargalo recorrente no monitoramento.",
      priority: "medium",
    });
  }

  rules.push({
    id: `rule-${index++}`,
    title: "Revisão semanal de KPIs",
    rule: "Revisar KPIs executivos toda segunda-feira com Samuel AI™.",
    rationale: "Monitoramento contínuo acelera aprendizado e correção de rota.",
    priority: "medium",
  });

  return rules;
}

function buildExperiences(input: ExecutiveLearningInput): ExecutiveExperience[] {
  const experiences: ExecutiveExperience[] = [];
  const now = new Date().toISOString();

  for (const memory of input.context?.memories.slice(0, 4) ?? []) {
    experiences.push({
      id: `exp-memory-${memory.id}`,
      title: memory.title,
      description:
        typeof memory.content === "string"
          ? memory.content
          : JSON.stringify(memory.content),
      outcome: isSuccessMemory(memory) ? "success" : "neutral",
      department: "Estratégia",
      learnedAt: now,
    });
  }

  for (const decision of input.decisions?.slice(0, 4) ?? []) {
    experiences.push({
      id: `exp-decision-${decision.id}`,
      title: decision.title,
      description: decision.description,
      outcome:
        decision.source === "strength"
          ? "success"
          : decision.source === "weakness" || decision.source === "risk"
            ? "pending"
            : "neutral",
      department: decision.department,
      learnedAt: now,
    });
  }

  for (const plan of input.executionPlans?.slice(0, 2) ?? []) {
    experiences.push({
      id: `exp-plan-${plan.id}`,
      title: plan.title,
      description: plan.objective,
      outcome: plan.status === "Completed" ? "success" : "pending",
      department: plan.department,
      learnedAt: now,
    });
  }

  return experiences.slice(0, 10);
}

function calculateEvolutionScore(input: ExecutiveLearningInput): number {
  let score = 35;

  score += Math.min(15, (input.context?.memories.length ?? 0) * 4);
  score += Math.min(12, (input.intelligence?.strengths.length ?? 0) * 3);
  score += Math.min(10, (input.decisions?.length ?? 0) * 2);
  score += Math.min(8, (input.executionPlans?.length ?? 0) * 2);
  score += Math.min(10, (input.monitoring?.kpis.length ?? 0) * 2);

  score -= Math.min(20, (input.intelligence?.weaknesses.length ?? 0) * 2);
  score -= Math.min(15, Math.round((input.monitoring?.progress.delayRisk ?? 0) * 0.15));

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildEvolution(
  input: ExecutiveLearningInput,
  evolutionScore: number,
): ExecutiveEvolution {
  const previousLevel = Math.max(0, evolutionScore - 8);
  const trajectory =
    evolutionScore >= previousLevel + 5
      ? "ascending"
      : evolutionScore < previousLevel - 3
        ? "declining"
        : "stable";

  const maturity =
    evolutionScore >= 75
      ? "Avançada"
      : evolutionScore >= 55
        ? "Em desenvolvimento"
        : evolutionScore >= 35
          ? "Inicial"
          : "Emergente";

  const companyName = input.context?.company.name ?? "Empresa";

  return {
    currentLevel: evolutionScore,
    previousLevel,
    trajectory,
    strategicMaturity: maturity,
    summary: `${companyName} evoluiu para maturidade estratégica ${maturity.toLowerCase()} com score ${evolutionScore}/100. O motor de aprendizado consolidou ${input.context?.memories.length ?? 0} memória(s), ${input.decisions?.length ?? 0} decisão(ões) e ${input.executionPlans?.length ?? 0} plano(s) de execução.`,
  };
}

function buildLessons(input: ExecutiveLearningInput): string[] {
  const lessons: string[] = [];

  if ((input.monitoring?.progress.notStartedPlans ?? 0) > 0) {
    lessons.push(
      "Planos sem kickoff não geram aprendizado operacional — execução precede otimização.",
    );
  }

  if ((input.intelligence?.weaknesses.length ?? 0) > 0) {
    lessons.push(
      "Fraquezas estruturais reaparecem quando não são convertidas em decisões com prazo.",
    );
  }

  if ((input.context?.memories.length ?? 0) > 0) {
    lessons.push(
      "Memórias estratégicas aumentam a qualidade das próximas análises executivas.",
    );
  }

  if ((input.monitoring?.progress.delayRisk ?? 0) >= 40) {
    lessons.push(
      "Alto risco de atraso indica que a empresa precisa reduzir paralelismo de iniciativas.",
    );
  }

  if ((input.intelligence?.strengths.length ?? 0) >= 2) {
    lessons.push(
      "Forças existentes devem ser convertidas em vantagem competitiva antes de novas apostas.",
    );
  }

  if (lessons.length === 0) {
    lessons.push(
      "Acumular mais análises e memórias acelerará a curva de aprendizado do Samuel AI™.",
    );
  }

  return lessons;
}

function buildBestPractices(input: ExecutiveLearningInput): string[] {
  const practices: string[] = [
    "Registrar toda decisão executiva com motivo, prazo e indicador de sucesso.",
    "Revisar KPIs e alertas antes de cada nova diretriz ao Samuel AI™.",
  ];

  if (input.decisions?.some((d) => d.impact === "Marketing")) {
    practices.push(
      "Validar posicionamento e proposta de valor antes de investir em campanhas.",
    );
  }

  if ((input.monitoring?.bottlenecks.length ?? 0) > 0) {
    practices.push(
      "Resolver gargalos identificados antes de abrir novas frentes de execução.",
    );
  }

  if ((input.context?.memories.length ?? 0) > 0) {
    practices.push(
      "Classificar memórias por impacto estratégico e reutilizar em análises futuras.",
    );
  }

  return practices;
}

function buildPermanentRecommendations(
  input: ExecutiveLearningInput,
): string[] {
  const recommendations: string[] = [];

  for (const priority of input.intelligence?.priorities.slice(0, 3) ?? []) {
    recommendations.push(`Manter foco permanente: ${priority}`);
  }

  for (const rule of buildRules(input).filter((r) => r.priority === "critical")) {
    recommendations.push(`Regra executiva: ${rule.rule}`);
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Institucionalizar ciclo semanal de análise, decisão, execução e aprendizado.",
    );
  }

  return [...new Set(recommendations)].slice(0, 6);
}

function buildImprovementHistory(
  evolutionScore: number,
): ImprovementMilestone[] {
  const now = Date.now();

  return [
    {
      date: new Date(now - 21 * 24 * 60 * 60 * 1000).toISOString(),
      milestone: "Executive Context integrado",
      scoreDelta: 8,
    },
    {
      date: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
      milestone: "Executive Intelligence ativada",
      scoreDelta: 10,
    },
    {
      date: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      milestone: "Decision & Execution pipeline conectado",
      scoreDelta: 12,
    },
    {
      date: new Date(now).toISOString(),
      milestone: "Executive Learning Engine consolidado",
      scoreDelta: Math.max(5, evolutionScore - 55),
    },
  ];
}

export function buildExecutiveLearning(
  input: ExecutiveLearningInput = {},
): ExecutiveLearning | null {
  const hasData =
    input.context ||
    input.intelligence ||
    (input.decisions?.length ?? 0) > 0 ||
    (input.executionPlans?.length ?? 0) > 0 ||
    input.monitoring;

  if (!hasData) return null;

  const evolutionScore = calculateEvolutionScore(input);
  const rules = buildRules(input);

  return {
    insights: buildInsights(input),
    patterns: buildPatterns(input),
    rules,
    experiences: buildExperiences(input),
    evolution: buildEvolution(input, evolutionScore),
    lessonsLearned: buildLessons(input),
    bestPractices: buildBestPractices(input),
    permanentRecommendations: buildPermanentRecommendations(input),
    improvementHistory: buildImprovementHistory(evolutionScore),
    evolutionScore,
  };
}
