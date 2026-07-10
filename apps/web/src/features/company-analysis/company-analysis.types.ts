import type { SuperbrainPipelineStep } from "../../core/superbrain/superbrain.types";

export type CompanyAnalysisPipelineStepName =
  | SuperbrainPipelineStep["name"]
  | "load_decision"
  | "load_action_planner"
  | "build_response";

export interface CompanyAnalysisPipelineStep extends Omit<SuperbrainPipelineStep, "name"> {
  name: CompanyAnalysisPipelineStepName;
}

export interface CompanyAnalysisInput {
  companyName: string;
  tenantId?: string;
  companyId?: string;
  userId?: string;
}

export interface AnalysisItem {
  id: string;
  title: string;
  description: string;
}

export interface AnalysisRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  department: string;
}

export interface PriorityAction {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  order: number;
}

export interface DecisionAnalysisData {
  id: string;
  strengths: AnalysisItem[];
  weaknesses: AnalysisItem[];
  opportunities: AnalysisItem[];
  risks: AnalysisItem[];
  recommendations: AnalysisRecommendation[];
  primaryDecision: string;
  rationale: string;
  generatedAt: string;
}

export interface ActionPlanData {
  id: string;
  decisionId: string;
  priorityActions: PriorityAction[];
  generatedAt: string;
}

export interface CompanyAnalysisRuntimeResponse {
  id: string;
  companyName: string;
  tenantId: string;
  companyId: string;
  summary: string;
  strengths: AnalysisItem[];
  weaknesses: AnalysisItem[];
  opportunities: AnalysisItem[];
  risks: AnalysisItem[];
  recommendations: AnalysisRecommendation[];
  priorityActions: PriorityAction[];
  confidence: number;
  pipeline: CompanyAnalysisPipelineStep[];
  totalDurationMs: number;
  generatedAt: string;
}

export interface CompanyAnalysisPipelineResult {
  superbrainSteps: SuperbrainPipelineStep[];
  decision: DecisionAnalysisData;
  actionPlan: ActionPlanData;
  confidence: number;
  companyName: string;
  tenantId: string;
  companyId: string;
  totalDurationMs: number;
}
