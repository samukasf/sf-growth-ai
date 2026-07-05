import type { ExecutiveContext } from "@/services/executive-context.service";

import type { ExecutiveCompetitor } from "./executive-competitor.service";
import type { ExecutiveDecision } from "./executive-decision.service";
import type { ExecutiveForecast } from "./executive-forecast.service";
import type { ExecutiveIntelligence } from "./executive-intelligence.service";
import type { ExecutiveStrategy } from "./executive-strategy.service";

export type ExecutiveEvidenceSource =
  | "context"
  | "intelligence"
  | "decision"
  | "forecast"
  | "competitor"
  | "strategy"
  | "module";

export type ExecutiveEvidence = {
  id: string;
  source: ExecutiveEvidenceSource;
  title: string;
  description: string;
  weight: number;
  reliability: "high" | "medium" | "low";
};

export type ExecutiveHypothesis = {
  id: string;
  statement: string;
  rationale: string;
  supportingEvidenceIds: string[];
  confidence: number;
  status: "validated" | "pending" | "rejected";
};

export type ExecutiveRiskAssessment = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  likelihood: number;
  mitigation: string;
  evidenceIds: string[];
};

export type ExecutiveTradeoff = {
  id: string;
  optionA: string;
  optionB: string;
  benefitA: string;
  benefitB: string;
  recommendation: string;
  rationale: string;
};

export type ExecutiveConclusion = {
  id: string;
  title: string;
  reason: string;
  evidenceIds: string[];
  positiveImpacts: string[];
  negativeImpacts: string[];
  risks: string[];
  alternatives: string[];
  confidence: number;
  justification: string;
};

export type ExecutiveReasoning = {
  question: string;
  primaryIntent: string;
  hypotheses: ExecutiveHypothesis[];
  evidence: ExecutiveEvidence[];
  risks: ExecutiveRiskAssessment[];
  tradeoffs: ExecutiveTradeoff[];
  conclusions: ExecutiveConclusion[];
  confidenceScore: number;
  confidenceRationale: string;
  reasoningSummary: string;
  processedAt: string;
};

export type ModuleReasoningInsight = {
  participantId: string;
  participantName: string;
  insight: string;
  healthScore: number | null;
  recommendations: string[];
};

export type ExecutiveReasoningInput = {
  question?: string;
  primaryIntent?: string;
  context?: ExecutiveContext | null;
  intelligence?: ExecutiveIntelligence | null;
  decisions?: ExecutiveDecision[];
  forecast?: ExecutiveForecast | null;
  competitor?: ExecutiveCompetitor | null;
  strategy?: ExecutiveStrategy | null;
  moduleInsights?: ModuleReasoningInsight[];
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function reliabilityFromWeight(weight: number): ExecutiveEvidence["reliability"] {
  if (weight >= 75) return "high";
  if (weight >= 50) return "medium";
  return "low";
}

function buildEvidence(input: ExecutiveReasoningInput): ExecutiveEvidence[] {
  const evidence: ExecutiveEvidence[] = [];
  let index = 0;

  if (input.context) {
    evidence.push({
      id: createId("evidence", index++),
      source: "context",
      title: `Contexto · ${input.context.company.name}`,
      description: input.context.summary,
      weight: 80,
      reliability: "high",
    });

    if (input.context.businessProfile?.positioning) {
      evidence.push({
        id: createId("evidence", index++),
        source: "context",
        title: "Posicionamento declarado",
        description: input.context.businessProfile.positioning,
        weight: 70,
        reliability: "high",
      });
    }
  }

  if (input.intelligence) {
    for (const strength of input.intelligence.strengths.slice(0, 2)) {
      evidence.push({
        id: createId("evidence", index++),
        source: "intelligence",
        title: "Força identificada",
        description: strength,
        weight: 72,
        reliability: "high",
      });
    }

    for (const weakness of input.intelligence.weaknesses.slice(0, 2)) {
      evidence.push({
        id: createId("evidence", index++),
        source: "intelligence",
        title: "Fraqueza identificada",
        description: weakness,
        weight: 68,
        reliability: "medium",
      });
    }

    for (const risk of input.intelligence.risks.slice(0, 2)) {
      evidence.push({
        id: createId("evidence", index++),
        source: "intelligence",
        title: "Risco estratégico",
        description: risk,
        weight: 74,
        reliability: "high",
      });
    }

    for (const opportunity of input.intelligence.opportunities.slice(0, 2)) {
      evidence.push({
        id: createId("evidence", index++),
        source: "intelligence",
        title: "Oportunidade mapeada",
        description: opportunity,
        weight: 70,
        reliability: "medium",
      });
    }
  }

  for (const decision of (input.decisions ?? []).slice(0, 3)) {
    evidence.push({
      id: createId("evidence", index++),
      source: "decision",
      title: decision.title,
      description: `${decision.description} · Impacto: ${decision.impact}`,
      weight: decision.priority === "Critical" ? 85 : decision.priority === "High" ? 75 : 60,
      reliability: "high",
    });
  }

  if (input.forecast) {
    evidence.push({
      id: createId("evidence", index++),
      source: "forecast",
      title: "Projeção de crescimento",
      description: `Crescimento esperado: ${input.forecast.expectedGrowth}. Probabilidade de sucesso: ${input.forecast.successProbability}%.`,
      weight: 78,
      reliability: "high",
    });

    const expectedScenario = input.forecast.scenarios.find(
      (scenario) => scenario.type === "expected",
    );
    if (expectedScenario) {
      evidence.push({
        id: createId("evidence", index++),
        source: "forecast",
        title: `Cenário ${expectedScenario.label}`,
        description: `Receita projetada ${expectedScenario.projectedRevenue} · ROI ${expectedScenario.roi}`,
        weight: 76,
        reliability: "medium",
      });
    }
  }

  if (input.competitor) {
    evidence.push({
      id: createId("evidence", index++),
      source: "competitor",
      title: "Panorama competitivo",
      description: input.competitor.executiveSummary,
      weight: 73,
      reliability: "medium",
    });

    for (const threat of input.competitor.threats.slice(0, 2)) {
      evidence.push({
        id: createId("evidence", index++),
        source: "competitor",
        title: threat.title,
        description: threat.description,
        weight: threat.severity === "critical" ? 82 : 68,
        reliability: "high",
      });
    }
  }

  if (input.strategy) {
    evidence.push({
      id: createId("evidence", index++),
      source: "strategy",
      title: "Direção estratégica",
      description: input.strategy.executiveStrategy,
      weight: 84,
      reliability: "high",
    });

    for (const priority of input.strategy.topPriorities.slice(0, 2)) {
      evidence.push({
        id: createId("evidence", index++),
        source: "strategy",
        title: "Prioridade estratégica",
        description: priority,
        weight: 77,
        reliability: "high",
      });
    }
  }

  for (const moduleInsight of input.moduleInsights ?? []) {
    evidence.push({
      id: createId("evidence", index++),
      source: "module",
      title: `${moduleInsight.participantName}`,
      description: moduleInsight.insight,
      weight:
        moduleInsight.healthScore !== null
          ? clampScore(moduleInsight.healthScore * 0.9)
          : 58,
      reliability: reliabilityFromWeight(
        moduleInsight.healthScore !== null ? moduleInsight.healthScore : 55,
      ),
    });
  }

  return evidence;
}

function buildHypotheses(
  question: string,
  primaryIntent: string,
  evidence: ExecutiveEvidence[],
): ExecutiveHypothesis[] {
  const companyEvidence = evidence.find((item) => item.source === "context");
  const moduleEvidence = evidence.filter((item) => item.source === "module");
  const opportunityEvidence = evidence.filter((item) =>
    item.title.toLowerCase().includes("oportunidade"),
  );
  const riskEvidence = evidence.filter((item) =>
    item.title.toLowerCase().includes("risco"),
  );

  const hypotheses: ExecutiveHypothesis[] = [
    {
      id: "hypothesis-1",
      statement: `A diretriz sobre ${primaryIntent} pode ser endereçada com ações de curto prazo sem comprometer a operação atual.`,
      rationale: "Baseado no contexto corporativo e nos módulos executivos consultados.",
      supportingEvidenceIds: [
        companyEvidence?.id,
        ...moduleEvidence.slice(0, 2).map((item) => item.id),
      ].filter((id): id is string => Boolean(id)),
      confidence: clampScore(
        55 +
          moduleEvidence.length * 8 +
          (companyEvidence ? 12 : 0),
      ),
      status: moduleEvidence.length >= 2 ? "validated" : "pending",
    },
    {
      id: "hypothesis-2",
      statement: `Existem alavancas de crescimento alinhadas à pergunta: "${question.slice(0, 80)}${question.length > 80 ? "…" : ""}".`,
      rationale: "Cruzamento entre inteligência, estratégia e sinais dos módulos.",
      supportingEvidenceIds: [
        ...opportunityEvidence.slice(0, 2).map((item) => item.id),
        ...moduleEvidence.slice(0, 1).map((item) => item.id),
      ],
      confidence: clampScore(50 + opportunityEvidence.length * 10 + moduleEvidence.length * 6),
      status: opportunityEvidence.length > 0 ? "validated" : "pending",
    },
    {
      id: "hypothesis-3",
      statement: "A execução imediata exige gestão ativa de riscos e trade-offs entre velocidade e sustentabilidade.",
      rationale: "Riscos mapeados pela inteligência e forecast indicam necessidade de mitigação.",
      supportingEvidenceIds: riskEvidence.slice(0, 3).map((item) => item.id),
      confidence: clampScore(48 + riskEvidence.length * 12),
      status: riskEvidence.length >= 2 ? "validated" : "pending",
    },
  ];

  return hypotheses;
}

function buildRiskAssessments(
  input: ExecutiveReasoningInput,
  evidence: ExecutiveEvidence[],
): ExecutiveRiskAssessment[] {
  const risks: ExecutiveRiskAssessment[] = [];
  let index = 0;

  for (const riskText of input.intelligence?.risks.slice(0, 3) ?? []) {
    const linkedEvidence = evidence.find(
      (item) => item.source === "intelligence" && item.description === riskText,
    );
    risks.push({
      id: createId("risk", index++),
      title: "Risco estratégico",
      description: riskText,
      severity: "high",
      likelihood: 65,
      mitigation: "Monitorar indicadores semanais e acionar plano de contingência.",
      evidenceIds: linkedEvidence ? [linkedEvidence.id] : [],
    });
  }

  for (const threat of input.competitor?.threats.slice(0, 2) ?? []) {
    const linkedEvidence = evidence.find(
      (item) => item.source === "competitor" && item.title === threat.title,
    );
    risks.push({
      id: createId("risk", index++),
      title: threat.title,
      description: threat.description,
      severity: threat.severity,
      likelihood: threat.severity === "critical" ? 78 : 58,
      mitigation: "Reforçar diferenciação e acelerar execução comercial.",
      evidenceIds: linkedEvidence ? [linkedEvidence.id] : [],
    });
  }

  if (input.forecast?.predictions.financialRisk) {
    risks.push({
      id: createId("risk", index++),
      title: "Risco financeiro projetado",
      description: input.forecast.predictions.financialRisk,
      severity: "medium",
      likelihood: 55,
      mitigation: "Proteger caixa e priorizar iniciativas com ROI comprovado.",
      evidenceIds: evidence
        .filter((item) => item.source === "forecast")
        .map((item) => item.id),
    });
  }

  const weakModules =
    input.moduleInsights?.filter(
      (module) => module.healthScore !== null && module.healthScore < 50,
    ) ?? [];

  for (const weakModule of weakModules) {
    const linkedEvidence = evidence.find(
      (item) =>
        item.source === "module" && item.title === weakModule.participantName,
    );
    risks.push({
      id: createId("risk", index++),
      title: `Pressão em ${weakModule.participantName}`,
      description: `Saúde do módulo em ${weakModule.healthScore}/100 — atenção operacional necessária.`,
      severity: "high",
      likelihood: 62,
      mitigation: weakModule.recommendations[0] ?? "Revisar plano corretivo do módulo.",
      evidenceIds: linkedEvidence ? [linkedEvidence.id] : [],
    });
  }

  if (risks.length === 0) {
    risks.push({
      id: "risk-1",
      title: "Risco de execução",
      description: "Incerteza moderada por dados parciais — validar hipóteses antes de escalar.",
      severity: "medium",
      likelihood: 45,
      mitigation: "Executar piloto de 30 dias com métricas claras de sucesso.",
      evidenceIds: evidence.slice(0, 2).map((item) => item.id),
    });
  }

  return risks;
}

function buildTradeoffs(input: ExecutiveReasoningInput): ExecutiveTradeoff[] {
  const moduleRecommendations =
    input.moduleInsights?.flatMap((module) => module.recommendations) ?? [];
  const strategyActions = input.strategy?.topPriorities ?? [];
  const decisionTitles = (input.decisions ?? []).map((decision) => decision.title);

  const optionA =
    moduleRecommendations[0] ??
    strategyActions[0] ??
    decisionTitles[0] ??
    "Acelerar execução imediata com foco em resultado rápido";
  const optionB =
    moduleRecommendations[1] ??
    strategyActions[1] ??
    decisionTitles[1] ??
    "Consolidar base operacional antes de expandir investimentos";

  return [
    {
      id: "tradeoff-1",
      optionA: "Velocidade de execução",
      optionB: "Robustez e sustentabilidade",
      benefitA: optionA,
      benefitB: optionB,
      recommendation: optionA,
      rationale:
        "O raciocínio executivo prioriza impacto mensurável em 30 dias, preservando mitigação de riscos críticos.",
    },
    {
      id: "tradeoff-2",
      optionA: "Investimento em crescimento",
      optionB: "Preservação de caixa",
      benefitA: "Maior tração comercial e visibilidade de mercado",
      benefitB: "Menor exposição financeira em cenário incerto",
      recommendation:
        input.forecast && input.forecast.successProbability >= 60
          ? "Investimento em crescimento"
          : "Preservação de caixa",
      rationale: input.forecast
        ? `Probabilidade de sucesso estimada em ${input.forecast.successProbability}%.`
        : "Forecast indisponível — postura conservadora recomendada.",
    },
  ];
}

function buildConclusions(
  input: ExecutiveReasoningInput,
  evidence: ExecutiveEvidence[],
  hypotheses: ExecutiveHypothesis[],
  risks: ExecutiveRiskAssessment[],
  tradeoffs: ExecutiveTradeoff[],
): ExecutiveConclusion[] {
  const companyName = input.context?.company.name ?? "empresa";
  const primaryIntent = input.primaryIntent ?? "estratégia geral";
  const topModule = input.moduleInsights?.[0];
  const topDecision = input.decisions?.[0];
  const topTradeoff = tradeoffs[0];
  const validatedHypotheses = hypotheses.filter(
    (hypothesis) => hypothesis.status === "validated",
  );

  const primaryEvidenceIds = evidence.slice(0, 5).map((item) => item.id);
  const opportunityEvidence = evidence.filter((item) =>
    item.title.toLowerCase().includes("oportunidade"),
  );
  const riskTitles = risks.slice(0, 3).map((risk) => risk.title);

  const conclusions: ExecutiveConclusion[] = [
    {
      id: "conclusion-1",
      title: `Diretriz prioritária para ${primaryIntent}`,
      reason: `A pergunta direciona foco em ${primaryIntent} para ${companyName}, com convergência entre contexto, módulos e estratégia.`,
      evidenceIds: primaryEvidenceIds,
      positiveImpacts: [
        topModule?.recommendations[0] ??
          input.intelligence?.opportunities[0] ??
          "Melhoria de performance na área consultada",
        validatedHypotheses[0]?.statement ??
          "Hipótese de execução de curto prazo validada",
        input.forecast
          ? `Crescimento projetado: ${input.forecast.expectedGrowth}`
          : "Potencial de ganho operacional em 30 dias",
      ],
      negativeImpacts: [
        input.intelligence?.weaknesses[0] ?? "Possível dispersão de recursos",
        "Necessidade de acompanhamento semanal durante a execução",
      ],
      risks: riskTitles,
      alternatives: [
        topTradeoff.optionB,
        topDecision?.title ?? "Adiar expansão e focar em eficiência",
        "Executar piloto reduzido antes de escalar investimento",
      ],
      confidence: clampScore(
        50 +
          validatedHypotheses.length * 10 +
          evidence.filter((item) => item.reliability === "high").length * 4,
      ),
      justification: `Conclusão derivada de ${evidence.length} evidência(s), ${validatedHypotheses.length} hipótese(s) validada(s) e ${risks.length} risco(s) mapeado(s).`,
    },
    {
      id: "conclusion-2",
      title: "Plano de mitigação e execução",
      reason: "Trade-offs identificados exigem decisão equilibrada entre velocidade e sustentabilidade.",
      evidenceIds: [
        ...opportunityEvidence.map((item) => item.id),
        ...evidence.filter((item) => item.source === "module").slice(0, 2).map((item) => item.id),
      ],
      positiveImpacts: [
        topTradeoff.recommendation,
        risks[0]?.mitigation ?? "Plano de contingência ativo",
        input.strategy?.topPriorities[0] ?? "Alinhamento com prioridades estratégicas",
      ],
      negativeImpacts: [
        "Custo de oportunidade na alternativa não escolhida",
        "Dependência de execução coordenada entre áreas",
      ],
      risks: risks.slice(0, 2).map((risk) => risk.description),
      alternatives: tradeoffs.map((tradeoff) => tradeoff.optionB),
      confidence: clampScore(
        45 +
          (input.strategy ? 15 : 0) +
          (input.forecast ? 10 : 0) +
          (topModule ? 8 : 0),
      ),
      justification:
        "Justificativa baseada em trade-offs explícitos, riscos priorizados e recomendações dos módulos executivos.",
    },
  ];

  return conclusions;
}

function calculateReasoningConfidence(
  evidence: ExecutiveEvidence[],
  hypotheses: ExecutiveHypothesis[],
  conclusions: ExecutiveConclusion[],
  input: ExecutiveReasoningInput,
): { score: number; rationale: string } {
  const evidenceScore =
    evidence.length > 0
      ? evidence.reduce((sum, item) => sum + item.weight, 0) / evidence.length
      : 40;

  const validatedRatio =
    hypotheses.length > 0
      ? hypotheses.filter((item) => item.status === "validated").length / hypotheses.length
      : 0;

  const conclusionScore =
    conclusions.length > 0
      ? conclusions.reduce((sum, item) => sum + item.confidence, 0) / conclusions.length
      : 45;

  const sourceBonus =
    (input.context ? 6 : 0) +
    (input.intelligence ? 6 : 0) +
    (input.strategy ? 5 : 0) +
    (input.forecast ? 4 : 0) +
    (input.competitor ? 4 : 0) +
    ((input.moduleInsights?.length ?? 0) > 0 ? 8 : 0);

  const score = clampScore(
    evidenceScore * 0.35 +
      conclusionScore * 0.35 +
      validatedRatio * 25 +
      sourceBonus,
  );

  const rationale = `Confiança baseada em ${evidence.length} evidência(s), ${hypotheses.filter((item) => item.status === "validated").length}/${hypotheses.length} hipótese(s) validada(s) e ${conclusions.length} conclusão(ões) estruturada(s).`;

  return { score, rationale };
}

function buildReasoningSummary(
  conclusions: ExecutiveConclusion[],
  hypotheses: ExecutiveHypothesis[],
  risks: ExecutiveRiskAssessment[],
  confidenceScore: number,
): string {
  const leadConclusion = conclusions[0];
  const validatedCount = hypotheses.filter((item) => item.status === "validated").length;

  return [
    `Raciocínio executivo concluído com confiança ${confidenceScore}/100.`,
    `${validatedCount} hipótese(s) validada(s), ${risks.length} risco(s) avaliado(s).`,
    leadConclusion
      ? `Conclusão principal: ${leadConclusion.title} — ${leadConclusion.reason}`
      : "Conclusão principal pendente de mais evidências.",
  ].join(" ");
}

export function buildExecutiveReasoning(
  input: ExecutiveReasoningInput = {},
): ExecutiveReasoning | null {
  const question = input.question?.trim();
  if (!question) return null;

  const hasSources =
    input.context ||
    input.intelligence ||
    (input.decisions?.length ?? 0) > 0 ||
    input.forecast ||
    input.competitor ||
    input.strategy ||
    (input.moduleInsights?.length ?? 0) > 0;

  if (!hasSources) return null;

  const primaryIntent = input.primaryIntent ?? "general";
  const evidence = buildEvidence(input);
  const hypotheses = buildHypotheses(question, primaryIntent, evidence);
  const risks = buildRiskAssessments(input, evidence);
  const tradeoffs = buildTradeoffs(input);
  const conclusions = buildConclusions(input, evidence, hypotheses, risks, tradeoffs);
  const { score: confidenceScore, rationale: confidenceRationale } =
    calculateReasoningConfidence(evidence, hypotheses, conclusions, input);
  const reasoningSummary = buildReasoningSummary(
    conclusions,
    hypotheses,
    risks,
    confidenceScore,
  );

  return {
    question,
    primaryIntent,
    hypotheses,
    evidence,
    risks,
    tradeoffs,
    conclusions,
    confidenceScore,
    confidenceRationale,
    reasoningSummary,
    processedAt: new Date().toISOString(),
  };
}
