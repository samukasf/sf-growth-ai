export type RuntimePhase =
  | "orchestrator"
  | "memory"
  | "context"
  | "company_brain"
  | "executive_council"
  | "decision"
  | "response";

export type RuntimePhaseStatus = "pending" | "running" | "complete";

export type RuntimePipelineStep = {
  id: RuntimePhase;
  label: string;
  status: RuntimePhaseStatus;
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

/** Resposta estruturada produzida pelo Samuel Runtime (Orchestrator → Response). */
export type RuntimeResponse = {
  query: string;
  pipeline: RuntimePipelineStep[];
  memory: RuntimeMemoryView;
  context: RuntimeContextView;
  companyBrain: RuntimeCompanyBrainView;
  executiveCouncil: RuntimeCouncilView;
  decision: RuntimeDecisionView;
  response: RuntimeResponseView;
  aiGateway: RuntimeAIGatewayMetadata;
  generatedAt: string;
};

export type RunSamuelRuntimeInput = {
  query: string;
  organizationId?: string;
  companyId?: string;
  companyName?: string;
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
