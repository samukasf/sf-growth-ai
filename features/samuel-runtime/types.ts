export type RuntimePhase =
  | "intent"
  | "goal_planning"
  | "conversation_memory"
  | "orchestrator"
  | "memory"
  | "context"
  | "company_brain"
  | "executive_council"
  | "decision"
  | "tooling"
  | "response";

export type RuntimePhaseStatus = "pending" | "running" | "complete";

export type RuntimePipelineStep = {
  id: RuntimePhase;
  label: string;
  status: RuntimePhaseStatus;
  /**
   * Observabilidade (Sprint 76) — timestamp ISO de início real da fase
   * (não é um valor animado/simulado; reflete `Date.now()` no momento em
   * que a fase começou a ser executada).
   */
  startedAt?: string;
  /** Observabilidade (Sprint 76) — timestamp ISO de conclusão real da fase. */
  completedAt?: string;
  /**
   * Observabilidade (Sprint 76) — duração real em ms (`completedAt -
   * startedAt`). Campo aditivo, não afeta nenhuma decisão do Samuel; serve
   * de base para futuros Performance Dashboard, Bottleneck Analysis, AI
   * Cost Analytics, Runtime Optimization e Executive Analytics.
   */
  durationMs?: number;
};

export type RuntimeMemoryView = {
  summary: string;
  insights: string[];
};

export type RuntimeContextView = {
  objective: string;
  fields: Array<{ label: string; value: string }>;
};

export type RuntimeCompanyBrainView = {
  status: "active" | "inactive";
  headline: string;
  facts: string[];
  confidence: number;
};

export type RuntimeCouncilSpecialist = {
  role: string;
  name: string;
  summary: string;
};

export type RuntimeCouncilView = {
  status: "ready" | "convening" | "deliberating";
  memberCount: number;
  consensus: string;
  specialists: RuntimeCouncilSpecialist[];
};

export type RuntimeDecisionView = {
  title: string;
  rationale: string;
  priority: string;
  nextAction: string;
  confidence: number;
};

export type RuntimeActionView = {
  title: string;
  description: string;
  priority: string;
  timeframe: string;
  impact: string;
};

export type RuntimeResponseView = {
  headline: string;
  narrative: string;
  actionPlanSummary: string;
  actions: RuntimeActionView[];
  confidence: {
    score: number;
    level: string;
    rationale: string;
  };
};

/**
 * Metadata de observabilidade da chamada ao AI Gateway feita na fase
 * `response`. `used: false` quando o Gateway não respondeu (sem provider
 * configurado, timeout, erro) e a narrativa veio do fallback heurístico —
 * nesse caso os demais campos não são preenchidos.
 */
export type RuntimeAIGatewayMetadata = {
  used: boolean;
  providerId?: string;
  providerType?: string;
  model?: string;
  operation?: string;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCostUsd?: number;
  latencyMs?: number;
  fallbackUsed?: boolean;
};

/**
 * Resultado do Intent Router (`@/features/samuel-intent-router`), a
 * primeira fase do pipeline. Apenas classificação — nenhuma fase
 * subsequente altera seu comportamento com base neste campo nesta sprint;
 * ele existe para observabilidade e para servir de base a decisões futuras.
 */
export type RuntimeIntentView =
  import("@/features/samuel-intent-router").IntentClassificationResult;

/**
 * Visão pública da memória da conversa ATIVA (Sprint 81) — apenas leitura,
 * derivada do `ConversationState` estruturado guardado em
 * `@/features/samuel-conversation-memory`. Não é memória permanente do
 * usuário; reflete só a conversa em curso.
 */
export type RuntimeConversationMemoryView =
  import("@/features/samuel-conversation-memory").ConversationMemorySummary;

/**
 * Resultado do Goal Planner (`@/features/samuel-goal-planner`, Sprint 82),
 * executado imediatamente após o Intent Router e antes de qualquer fase de
 * decisão. Apenas planejamento — nenhuma etapa aqui é executada; o plano
 * existe para observabilidade e para servir de base a decisões futuras.
 */
export type RuntimeGoalPlanView =
  import("@/features/samuel-goal-planner").GoalPlan;

/**
 * Resultado da fase opcional de Tool Planning (Sprint 80), executada entre
 * `decision` e `response`. `attempted: false` quando o `ToolPlanner` não
 * reconheceu nenhuma ferramenta necessária para a pergunta — nesse caso o
 * restante do pipeline segue exatamente como antes desta sprint. Quando uma
 * ferramenta é selecionada, sua execução passa exclusivamente pelo
 * `ToolOrchestrator` já existente (`@/features/samuel-tool-orchestrator`);
 * este tipo apenas espelha, para observabilidade, o que o Orchestrator
 * devolveu (nunca lança — falhas aparecem em `status`/`error`).
 */
export type RuntimeToolExecutionView = {
  attempted: boolean;
  toolName?: string;
  /** Justificativa determinística de por que o ToolPlanner escolheu esta ferramenta. */
  reason?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  status?: "success" | "error";
  error?: string;
  durationMs?: number;
};

/**
 * Etapa individual do Multi-Tool Task Orchestrator (Sprint 90) — observabilidade
 * da sequência de ferramentas, duração e status por etapa no Playground.
 */
export type RuntimeMultiToolStepView = {
  id: string;
  toolName: string;
  actionId?: string;
  reason: string;
  status: "pending" | "success" | "error" | "skipped";
  durationMs?: number;
  error?: string;
};

/**
 * Resultado do Multi-Tool Task Orchestrator (Sprint 90). `attempted: false`
 * quando o Task Planner não reconheceu uma tarefa multi-ferramenta — nesse
 * caso o runtime segue pelo Tool Planner de ferramenta única (Sprint 80).
 */
export type RuntimeMultiToolTaskView = {
  enabled: boolean;
  attempted: boolean;
  overallStatus?: "none" | "success" | "partial" | "error";
  summary?: string;
  steps?: RuntimeMultiToolStepView[];
  totalDurationMs?: number;
};

/** Resposta estruturada produzida pelo Samuel Runtime (Intent → Response). */
export type RuntimeResponse = {
  query: string;
  pipeline: RuntimePipelineStep[];
  intent: RuntimeIntentView;
  goalPlan: RuntimeGoalPlanView;
  memory: RuntimeMemoryView;
  context: RuntimeContextView;
  companyBrain: RuntimeCompanyBrainView;
  executiveCouncil: RuntimeCouncilView;
  decision: RuntimeDecisionView;
  tooling: RuntimeToolExecutionView;
  multiToolTask: RuntimeMultiToolTaskView;
  conversationMemory: RuntimeConversationMemoryView;
  response: RuntimeResponseView;
  aiGateway: RuntimeAIGatewayMetadata;
  generatedAt: string;
};

export type RunSamuelRuntimeInput = {
  query: string;
  organizationId?: string;
  companyId?: string;
  companyName?: string;
  /**
   * Identifica a conversa ativa para a memória conversacional (Sprint 81).
   * Sem ele, cai no fallback `${organizationId}:${companyId}` — cada
   * chamador (UI, Playground) deve gerar e reutilizar um id estável por
   * sessão de chat para ter memória real entre turnos.
   */
  conversationId?: string;
  companyContext?: import("@/services/executive-context.service").ExecutiveContext | null;
  animate?: boolean;
  onPhase?: (phase: RuntimePhase, pipeline: RuntimePipelineStep[]) => void;
  /**
   * Modo de execução do AI Gateway para a narrativa desta chamada
   * (default: "reason"). Permite que o contexto do chamador (ex.: tipo de
   * pergunta, organização) escolha um modo diferente sem alterar o núcleo
   * do Gateway — ver `features/samuel-runtime/ai-gateway-operations.ts`.
   */
  aiGatewayOperation?: import("./ai-gateway-operations").SamuelAIOperation;
};
