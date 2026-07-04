import type {
  ExecutiveActionPlan,
  ExecutiveContext,
  ExecutiveMemory,
  ExecutiveReasoning,
  ReasoningStepStatus,
} from "../executive-brain/types";

export type QueryIntent = "sales" | "marketing" | "growth" | "general";

export type SprintExecutiveId =
  | "samuel"
  | "sophia"
  | "victor"
  | "lucas"
  | "business-twin"
  | "market-intelligence";

export type MockExecutive = {
  id: SprintExecutiveId;
  name: string;
  role: string;
  title: string;
  domain: string;
};

export type ConsultationStatus = "pending" | "consulting" | "consulted";

export type ConsultedExecutive = MockExecutive & {
  reason: string;
  status: ConsultationStatus;
  opinion?: string;
};

export type OrchestratorPhase =
  | "idle"
  | "building_context"
  | "selecting_executives"
  | "running_analysis"
  | "building_consensus"
  | "building_action_plan"
  | "complete";

export type AnalysisPipelineStep = {
  id: string;
  order: number;
  label: string;
  description: string;
  status: ReasoningStepStatus;
  executive?: string;
  finding?: string;
};

export type ExecutiveAnalysisResult = {
  steps: AnalysisPipelineStep[];
  reasoning: ExecutiveReasoning;
};

export type ExecutiveConfidenceLevel = "high" | "medium" | "low";

export type ExecutiveConfidence = {
  score: number;
  level: ExecutiveConfidenceLevel;
  rationale: string;
};

export type OrchestratorSnapshot = {
  phase: OrchestratorPhase;
  userQuery: string;
  context: ExecutiveContext | null;
  consultedExecutives: ConsultedExecutive[];
  analysis: ExecutiveAnalysisResult | null;
  consensus: string | null;
  actionPlan: ExecutiveActionPlan | null;
  confidence: ExecutiveConfidence | null;
  memory: ExecutiveMemory | null;
};

export type OrchestratorResult = {
  context: ExecutiveContext;
  consultedExecutives: ConsultedExecutive[];
  analysis: ExecutiveAnalysisResult;
  consensus: string;
  actionPlan: ExecutiveActionPlan;
  confidence: ExecutiveConfidence;
  memory: ExecutiveMemory;
};

/** @deprecated Use ConsultedExecutive */
export type SelectedExecutive = ConsultedExecutive;
