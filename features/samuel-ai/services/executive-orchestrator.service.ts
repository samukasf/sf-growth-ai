import { BASE_COMPANY, DEFAULT_EXECUTIVE_BRAIN } from "../executive-brain/mock-data";
import type {
  ExecutiveAction,
  ExecutiveActionPlan,
  ExecutiveBrain,
  ExecutiveContext,
  ExecutiveMemory,
  ExecutiveReasoning,
  ConsultationSource,
} from "../executive-brain/types";
import type {
  AnalysisPipelineStep,
  ConsultedExecutive,
  ConsultationStatus,
  ExecutiveAnalysisResult,
  ExecutiveConfidence,
  OrchestratorPhase,
  OrchestratorResult,
  OrchestratorSnapshot,
  QueryIntent,
  SprintExecutiveId,
} from "./executive-orchestrator.types";
import { MOCK_EXECUTIVES } from "./mock-executives";

export type {
  AnalysisPipelineStep,
  ConsultedExecutive,
  ExecutiveAnalysisResult,
  ExecutiveConfidence,
  OrchestratorPhase,
  OrchestratorResult,
  OrchestratorSnapshot,
  SelectedExecutive,
} from "./executive-orchestrator.types";

const CONSULTATION_SOURCES: Omit<ConsultationSource, "status">[] = [
  { id: "c-crm", label: "CRM" },
  { id: "c-fin", label: "Financeiro" },
  { id: "c-mkt", label: "Marketing" },
  { id: "c-twin", label: "Business Twin" },
  { id: "c-mkt-ext", label: "Mercado" },
  { id: "c-comp", label: "Concorrentes" },
  { id: "c-hist", label: "Histórico" },
];

const CONSULTATION_REASONS: Record<SprintExecutiveId, string> = {
  samuel: "Coordenar análise e sintetizar decisão final",
  sophia: "Avaliar canais de aquisição, demanda e posicionamento de marca",
  victor: "Validar viabilidade financeira, ROI e alocação de budget",
  lucas: "Verificar capacidade operacional e prontidão de execução",
  "business-twin": "Fornecer fatos internos verificados da empresa",
  "market-intelligence": "Contextualizar tendências, concorrência e economia",
};

const EXECUTIVE_OPINIONS: Record<
  QueryIntent,
  Partial<Record<SprintExecutiveId, string>>
> = {
  sales: {
    sophia: "Gap de aquisição digital explica 60% da queda — campanhas pausadas desde maio.",
    victor: "Margem preservada; problema é volume. Budget de R$ 800/mês para retargeting é viável.",
    lucas: "Operação absorve +20% de demanda sem contratação — prontidão confirmada.",
    "business-twin": "340 clientes inativos elegíveis. Receita −12% vs. meta de R$ 55.000.",
    "market-intelligence": "Concorrentes locais intensificaram presença digital nos últimos 45 dias.",
  },
  marketing: {
    sophia: "Canais operam a 42% da capacidade. Google Business Profile é quick win imediato.",
    victor: "Teto de R$ 800/mês aprovado para retargeting com payback estimado em 21 dias.",
    "business-twin": "Tráfego orgânico −18%. Investimento em ads zerado desde 12/05.",
    "market-intelligence": "Sazonalidade favorável nas próximas 3 semanas para campanhas locais.",
  },
  growth: {
    sophia: "Marketing Digital concentra o maior gap — potencial de +80 pontos no score.",
    victor: "ROI projetado positivo em automações de baixo custo (< R$ 200/mês).",
    lucas: "Fluxo de avaliações automatizado pode gerar +15 reviews/mês sem fricção operacional.",
    "business-twin": "Growth Score™ em 642/1000 — potencial identificado de +158 pontos.",
    "market-intelligence": "Empresas do segmento com score >750 crescem 2,3× mais rápido.",
  },
  general: {
    sophia: "Quick wins em presença local têm maior impacto imediato em visibilidade.",
    victor: "Ações prioritárias cabem no caixa atual sem comprometer reserva operacional.",
    lucas: "Equipe atual suporta execução paralela de até 3 iniciativas simultâneas.",
    "business-twin": "Receita 12% abaixo da meta. Padrões históricos indicam reversão em 30 dias.",
    "market-intelligence": "Demanda local estável; janela de oportunidade aberta para diferenciação.",
  },
};

export function detectQueryIntent(query: string): QueryIntent {
  const normalized = query.toLowerCase();

  if (
    normalized.includes("venda") ||
    normalized.includes("faturamento") ||
    normalized.includes("receita")
  ) {
    return "sales";
  }

  if (
    normalized.includes("marketing") ||
    normalized.includes("anúncio") ||
    normalized.includes("campanha") ||
    normalized.includes("tráfego")
  ) {
    return "marketing";
  }

  if (
    normalized.includes("crescimento") ||
    normalized.includes("growth") ||
    normalized.includes("score")
  ) {
    return "growth";
  }

  return "general";
}

function buildObjective(intent: QueryIntent): string {
  const objectives: Record<QueryIntent, string> = {
    sales: "Diagnosticar performance de vendas e definir ações de reversão",
    marketing: "Avaliar eficácia do marketing e otimizar canais de aquisição",
    growth: "Identificar oportunidades de crescimento e elevar o Growth Score™",
    general: "Analisar o negócio e gerar recomendações estratégicas acionáveis",
  };

  return objectives[intent];
}

export function buildExecutiveContext(userQuery: string): ExecutiveContext {
  const intent = detectQueryIntent(userQuery);
  const baseFields = DEFAULT_EXECUTIVE_BRAIN.context.fields;

  const intentFields: Record<QueryIntent, ExecutiveContext["fields"]> = {
    sales: [
      { id: "f-sales-1", label: "Variação de vendas", value: "−12% no último mês" },
      { id: "f-sales-2", label: "Meta mensal", value: "R$ 55.000" },
      { id: "f-sales-3", label: "Gap para meta", value: "R$ 6.800" },
    ],
    marketing: [
      { id: "f-mkt-1", label: "Investimento em ads", value: "R$ 0 (pausado)" },
      { id: "f-mkt-2", label: "Tráfego orgânico", value: "−18% vs. mês anterior" },
      { id: "f-mkt-3", label: "Engajamento social", value: "3,2% (estável)" },
    ],
    growth: [
      { id: "f-gr-1", label: "Growth Score™", value: "642 / 1000" },
      { id: "f-gr-2", label: "Potencial identificado", value: "+158 pontos" },
      { id: "f-gr-3", label: "Área crítica", value: "Marketing Digital" },
    ],
    general: baseFields.slice(0, 3),
  };

  return {
    ...BASE_COMPANY,
    detectedObjective: buildObjective(intent),
    fields: [...intentFields[intent], ...baseFields.slice(0, 2)],
  };
}

function getConsultationIds(intent: QueryIntent): SprintExecutiveId[] {
  const base: SprintExecutiveId[] = ["business-twin", "market-intelligence"];

  const byIntent: Record<QueryIntent, SprintExecutiveId[]> = {
    sales: ["sophia", "victor", "lucas"],
    marketing: ["sophia", "victor"],
    growth: ["sophia", "victor", "lucas"],
    general: ["sophia", "victor", "lucas"],
  };

  return [...byIntent[intent], ...base];
}

function resolveConsultationStatus(
  index: number,
  total: number,
  phase: OrchestratorPhase,
): ConsultationStatus {
  if (phase === "selecting_executives") {
    return index === 0 ? "consulting" : "pending";
  }

  if (phase === "running_analysis") {
    const consultedCount = Math.min(
      total,
      Math.max(1, Math.floor((total * 2) / 3)),
    );
    if (index < consultedCount - 1) return "consulted";
    if (index === consultedCount - 1) return "consulting";
    return "pending";
  }

  if (
    ["building_consensus", "building_action_plan", "complete"].includes(phase)
  ) {
    return "consulted";
  }

  return "pending";
}

export function selectExecutives(
  userQuery: string,
  context: ExecutiveContext,
  phase: OrchestratorPhase = "complete",
): ConsultedExecutive[] {
  void context;

  const intent = detectQueryIntent(userQuery);
  const ids = getConsultationIds(intent);
  const opinions = EXECUTIVE_OPINIONS[intent];

  return ids.map((id, index) => {
    const executive = MOCK_EXECUTIVES[id];
    const status = resolveConsultationStatus(index, ids.length, phase);
    const hasOpinion = status === "consulted";

    return {
      ...executive,
      reason: CONSULTATION_REASONS[id],
      status,
      opinion: hasOpinion ? opinions[id] : undefined,
    };
  });
}

function buildConsultations(
  phase: "building" | "complete",
): ConsultationSource[] {
  return CONSULTATION_SOURCES.map((source, index) => ({
    ...source,
    status:
      phase === "complete"
        ? "completed"
        : index < 4
          ? "completed"
          : index === 4
            ? "in_progress"
            : "pending",
  }));
}

function buildAnalysisSteps(
  intent: QueryIntent,
  executives: ConsultedExecutive[],
  context: ExecutiveContext,
  phase: "building" | "complete",
): AnalysisPipelineStep[] {
  const focusByIntent: Record<QueryIntent, string> = {
    sales: "Correlacionar queda de receita com canais de aquisição",
    marketing: "Mapear eficiência e gaps nos canais de aquisição",
    growth: "Identificar alavancas de crescimento com maior ROI",
    general: "Sintetizar contexto interno e externo para decisão estratégica",
  };

  const findingsByIntent: Record<QueryIntent, string[]> = {
    sales: [
      "Business Twin™ confirma queda de 12% correlacionada a tráfego orgânico",
      "Market Intelligence sinaliza intensificação digital dos concorrentes",
      "Sophia identifica gap de aquisição por campanhas pausadas",
      "Victor valida margem preservada — problema é volume, não pricing",
      "Lucas confirma capacidade operacional para absorver demanda adicional",
      "Samuel AI sintetiza hipóteses e elimina cenários de baixo impacto",
    ],
    marketing: [
      "Business Twin™ reporta investimento em ads zerado desde maio",
      "Market Intelligence aponta janela sazonal favorável",
      "Sophia mapeia canais operando a 42% da capacidade",
      "Victor aprova teto de R$ 800/mês com payback em 21 dias",
      "Samuel AI consolida quick wins em presença local",
      "Hipóteses fracas eliminadas — foco em retargeting e GBP",
    ],
    growth: [
      "Business Twin™ confirma Growth Score™ em 642 com potencial de +158",
      "Market Intelligence valida benchmark do segmento (>750 = 2,3× crescimento)",
      "Sophia prioriza Marketing Digital como maior gap",
      "Victor projeta ROI positivo em automações de baixo custo",
      "Lucas valida fluxo de avaliações sem fricção operacional",
      "Samuel AI define sequência de execução em 90 dias",
    ],
    general: [
      "Business Twin™ apresenta receita 12% abaixo da meta mensal",
      "Market Intelligence confirma demanda local estável",
      "Sophia, Victor e Lucas convergem para quick wins mensuráveis",
      "Padrões históricos indicam reversão em 30 dias",
      "Samuel AI elimina ações de alto custo e baixo retorno",
      "Consenso preliminar formado para execução imediata",
    ],
  };

  const pipelineLabels = [
    "Consultar Business Twin™",
    "Consultar Market Intelligence",
    `Analisar objetivo — ${context.detectedObjective}`,
    "Convocar Conselho Executivo",
    "Cruzar pareceres individuais",
    "Eliminar hipóteses fracas",
  ];

  const activeExecutives = executives.filter(
    (e) => !["business-twin", "market-intelligence"].includes(e.id),
  );

  return pipelineLabels.map((label, index) => {
    const isComplete = phase === "complete" || index < 3;
    const isInProgress = phase === "building" && index === 3;

    return {
      id: `pipeline-${index + 1}`,
      order: index + 1,
      label,
      description: index === 2 ? focusByIntent[intent] : label,
      status: isComplete
        ? ("completed" as const)
        : isInProgress
          ? ("in_progress" as const)
          : ("pending" as const),
      executive:
        index < 2
          ? pipelineLabels[index].replace("Consultar ", "")
          : activeExecutives[index % Math.max(activeExecutives.length, 1)]?.name,
      finding: isComplete ? findingsByIntent[intent][index] : undefined,
    };
  });
}

export function runExecutiveAnalysis(
  userQuery: string,
  context: ExecutiveContext,
  executives: ConsultedExecutive[],
  phase: "building" | "complete" = "complete",
): ExecutiveAnalysisResult {
  const intent = detectQueryIntent(userQuery);

  const focusByIntent: Record<QueryIntent, string> = {
    sales: "Isolar variáveis que explicam a queda de receita",
    marketing: "Mapear eficiência e gaps nos canais de aquisição",
    growth: "Identificar alavancas de crescimento com maior ROI",
    general: "Sintetizar contexto interno e externo para decisão estratégica",
  };

  const reasoningSteps = DEFAULT_EXECUTIVE_BRAIN.reasoning.steps.map(
    (step, index) => ({
      ...step,
      status:
        phase === "complete"
          ? ("completed" as const)
          : index < 3
            ? ("completed" as const)
            : index === 3
              ? ("in_progress" as const)
              : ("pending" as const),
    }),
  );

  const reasoning: ExecutiveReasoning = {
    currentFocus: focusByIntent[intent],
    consultations: buildConsultations(phase),
    executiveConsensus: null,
    steps: reasoningSteps,
  };

  return {
    steps: buildAnalysisSteps(intent, executives, context, phase),
    reasoning,
  };
}

export function buildConsensus(
  userQuery: string,
  analysis: ExecutiveAnalysisResult,
  executives: ConsultedExecutive[],
): string {
  void analysis;
  void executives;

  const intent = detectQueryIntent(userQuery);

  const consensus: Record<QueryIntent, string> = {
    sales:
      "Conselho unânime liderado por Samuel AI: a queda de receita é reversível em 30 dias. Sophia confirma gap de aquisição digital. Victor valida viabilidade financeira do retargeting. Lucas garante capacidade operacional. Business Twin™ e Market Intelligence sustentam o diagnóstico com dados verificados.",
    marketing:
      "Consenso executivo: canais de aquisição operam abaixo da capacidade. Sophia lidera reativação segmentada. Victor aprova teto de R$ 800/mês. Business Twin™ confirma pausa de campanhas desde maio. Market Intelligence sinaliza janela sazonal favorável.",
    growth:
      "Conselho alinhado: potencial de +158 pontos no Growth Score™ é alcançável em 90 dias. Sophia prioriza Marketing Digital. Victor valida ROI de automações. Lucas confirma execução operacional. Business Twin™ e Market Intelligence fundamentam o plano.",
    general:
      "Samuel AI sintetiza pareceres unificados: Sophia, Victor e Lucas convergem para ações mensuráveis com impacto direto em receita. Business Twin™ apresenta fatos internos. Market Intelligence contextualiza o mercado. Execução imediata de quick wins recomendada.",
  };

  return consensus[intent];
}

export function buildExecutiveConfidence(
  userQuery: string,
  analysis: ExecutiveAnalysisResult,
  consensus: string,
): ExecutiveConfidence {
  void analysis;
  void consensus;

  const intent = detectQueryIntent(userQuery);

  const scores: Record<QueryIntent, number> = {
    sales: 87,
    marketing: 82,
    growth: 79,
    general: 75,
  };

  const rationales: Record<QueryIntent, string> = {
    sales:
      "Alta convergência entre Sophia, Victor e Lucas. Business Twin™ e Market Intelligence corroboram o diagnóstico com dados consistentes.",
    marketing:
      "Consenso sólido com dados internos e externos alinhados. Incerteza residual limitada ao timing de retorno das campanhas.",
    growth:
      "Projeções fundamentadas, porém dependem de execução sequencial em 90 dias — confiança moderada-alta.",
    general:
      "Análise abrangente com convergência parcial. Recomenda-se validação após primeiros 14 dias de execução.",
  };

  const score = scores[intent];

  return {
    score,
    level: score >= 85 ? "high" : score >= 75 ? "medium" : "low",
    rationale: rationales[intent],
  };
}

function buildActions(intent: QueryIntent): ExecutiveAction[] {
  const actionsByIntent: Record<QueryIntent, ExecutiveAction[]> = {
    sales: DEFAULT_EXECUTIVE_BRAIN.actionPlan.actions,
    marketing: [
      {
        id: "act-mkt-1",
        priority: "critical",
        title: "Reativar campanhas segmentadas",
        description:
          "Retomar anúncios com orçamento controlado focado em retargeting local.",
        expectedImpact: "high",
        impactDescription: "+20–30% de tráfego qualificado em 21 dias",
        nextStep: "Definir orçamento de R$ 800/mês e criar 3 públicos de retargeting",
        timeframe: "7 dias",
      },
      {
        id: "act-mkt-2",
        priority: "high",
        title: "Calendário de conteúdo orgânico",
        description:
          "Publicar 3 posts semanais no Instagram com foco em produtos sazonais.",
        expectedImpact: "medium",
        impactDescription: "+12% de engajamento e alcance local",
        nextStep: "Planejar conteúdo da próxima semana com fotos do cardápio",
        timeframe: "14 dias",
      },
    ],
    growth: [
      {
        id: "act-gr-1",
        priority: "high",
        title: "Plano de elevação do Growth Score™",
        description:
          "Focar nas 3 áreas com maior gap: Marketing, Digital e Automação.",
        expectedImpact: "high",
        impactDescription: "+80–120 pontos em 90 dias",
        nextStep: "Executar diagnóstico detalhado das 3 áreas críticas",
        timeframe: "30 dias",
      },
      {
        id: "act-gr-2",
        priority: "medium",
        title: "Automatizar coleta de avaliações",
        description:
          "Implementar fluxo pós-compra solicitando avaliação no Google.",
        expectedImpact: "medium",
        impactDescription: "+15 avaliações/mês e melhoria de autoridade local",
        nextStep: "Configurar mensagem automática via WhatsApp Business",
        timeframe: "14 dias",
      },
    ],
    general: DEFAULT_EXECUTIVE_BRAIN.actionPlan.actions.slice(0, 2),
  };

  return actionsByIntent[intent];
}

function buildSummary(intent: QueryIntent): string {
  const summaries: Record<QueryIntent, string> = {
    sales:
      "Diagnóstico concluído: queda de tráfego orgânico e pausa de campanhas explicam 78% da redução de receita. Plano de reversão definido com ROI projetado em 30 dias.",
    marketing:
      "Análise concluída: canais de aquisição operam a 42% da capacidade. Reativação segmentada e fortalecimento orgânico são as alavancas prioritárias.",
    growth:
      "Avaliação concluída: potencial de +158 pontos no Growth Score™ identificado. Marketing Digital e automação concentram o maior gap de maturidade.",
    general:
      "Análise estratégica concluída. Recomendo execução imediata de ações mensuráveis com impacto direto em receita e visibilidade local.",
  };

  return summaries[intent];
}

function buildMemory(intent: QueryIntent): ExecutiveMemory {
  const base = DEFAULT_EXECUTIVE_BRAIN.memory;

  const intentPatterns: Record<QueryIntent, string[]> = {
    sales: [
      "Quedas acima de 10% correlacionam com redução de tráfego em 2–3 semanas",
      "Campanhas de reativação tiveram ROI de 4,2x no último trimestre",
    ],
    marketing: [
      "Pausa de anúncios em maio coincide com início da queda de aquisição",
      "Google Business Profile gerou 34% das visitas orgânicas em abril",
    ],
    growth: [
      "Empresas do segmento com score acima de 750 crescem 2,3x mais rápido",
      "Marketing Digital é o maior gap de maturidade identificado",
    ],
    general: base.relevantPatterns.slice(0, 2),
  };

  return {
    ...base,
    relevantPatterns: intentPatterns[intent],
  };
}

export function buildActionPlan(
  userQuery: string,
  context: ExecutiveContext,
  consensus: string,
): ExecutiveActionPlan {
  void context;
  void consensus;

  const intent = detectQueryIntent(userQuery);

  return {
    summary: buildSummary(intent),
    actions: buildActions(intent),
  };
}

export function runExecutiveOrchestration(userQuery: string): OrchestratorResult {
  const context = buildExecutiveContext(userQuery);
  const consultedExecutives = selectExecutives(userQuery, context, "complete");
  const analysis = runExecutiveAnalysis(
    userQuery,
    context,
    consultedExecutives,
    "complete",
  );
  const consensus = buildConsensus(userQuery, analysis, consultedExecutives);
  const actionPlan = buildActionPlan(userQuery, context, consensus);
  const confidence = buildExecutiveConfidence(userQuery, analysis, consensus);
  const memory = buildMemory(detectQueryIntent(userQuery));

  analysis.reasoning.executiveConsensus = consensus;

  return {
    context,
    consultedExecutives,
    analysis,
    consensus,
    actionPlan,
    confidence,
    memory,
  };
}

export function orchestratorResultToBrain(
  userQuery: string,
  result: OrchestratorResult,
): ExecutiveBrain {
  return {
    id: `brain-${crypto.randomUUID()}`,
    builtAt: new Date().toISOString(),
    userQuery,
    context: result.context,
    memory: result.memory,
    reasoning: {
      ...result.analysis.reasoning,
      executiveConsensus: result.consensus,
    },
    actionPlan: result.actionPlan,
  };
}

export function runExecutiveOrchestrationToBrain(userQuery: string): ExecutiveBrain {
  return orchestratorResultToBrain(userQuery, runExecutiveOrchestration(userQuery));
}

export function buildOrchestratorSnapshot(
  userQuery: string,
  phase: OrchestratorPhase,
): OrchestratorSnapshot {
  const context =
    phase === "idle" ? null : buildExecutiveContext(userQuery);

  const consultedExecutives =
    context && phase !== "building_context"
      ? selectExecutives(userQuery, context, phase)
      : [];

  const analysis =
    context &&
    consultedExecutives.length > 0 &&
    !["idle", "building_context", "selecting_executives"].includes(phase)
      ? runExecutiveAnalysis(
          userQuery,
          context,
          consultedExecutives,
          phase === "complete" || phase === "building_action_plan"
            ? "complete"
            : "building",
        )
      : null;

  const consensus =
    analysis &&
    ["building_consensus", "building_action_plan", "complete"].includes(phase)
      ? buildConsensus(userQuery, analysis, consultedExecutives)
      : null;

  const actionPlan =
    context && consensus && ["building_action_plan", "complete"].includes(phase)
      ? buildActionPlan(userQuery, context, consensus)
      : null;

  const confidence =
    analysis && consensus && phase === "complete"
      ? buildExecutiveConfidence(userQuery, analysis, consensus)
      : null;

  const memory =
    phase === "complete"
      ? buildMemory(detectQueryIntent(userQuery))
      : null;

  if (analysis && consensus) {
    analysis.reasoning.executiveConsensus = consensus;
  }

  return {
    phase,
    userQuery,
    context,
    consultedExecutives,
    analysis,
    consensus,
    actionPlan,
    confidence,
    memory,
  };
}

export function snapshotToBrain(snapshot: OrchestratorSnapshot): ExecutiveBrain {
  if (
    !snapshot.context ||
    !snapshot.analysis ||
    !snapshot.consensus ||
    !snapshot.actionPlan ||
    !snapshot.memory
  ) {
    throw new Error("Snapshot incompleto para conversão em ExecutiveBrain");
  }

  return orchestratorResultToBrain(snapshot.userQuery, {
    context: snapshot.context,
    consultedExecutives: snapshot.consultedExecutives,
    analysis: snapshot.analysis,
    consensus: snapshot.consensus,
    actionPlan: snapshot.actionPlan,
    confidence: snapshot.confidence!,
    memory: snapshot.memory,
  });
}

export function generateOrchestratorResponse(brain: ExecutiveBrain): string {
  const topAction = brain.actionPlan.actions[0];

  if (!topAction) {
    return "Análise concluída. O contexto do negócio foi processado pelo Executive Orchestrator.";
  }

  const priorityLabel =
    topAction.priority === "critical"
      ? "crítica"
      : topAction.priority === "high"
        ? "alta"
        : "estratégica";

  return [
    "Análise executiva concluída.",
    "",
    brain.actionPlan.summary,
    "",
    `Diretriz ${priorityLabel}: ${topAction.title}.`,
    topAction.description,
    "",
    `Impacto projetado: ${topAction.impactDescription}.`,
    `Ação imediata: ${topAction.nextStep}.`,
    `Prazo de execução: ${topAction.timeframe}.`,
  ].join("\n");
}
