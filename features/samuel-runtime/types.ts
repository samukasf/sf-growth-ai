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
};
