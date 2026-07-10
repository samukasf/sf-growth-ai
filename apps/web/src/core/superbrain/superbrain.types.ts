import type { PipelineStep } from "../orchestrator/orchestrator.types";

export type SuperbrainPipelineStepName =
  | PipelineStep["name"]
  | "load_decision";

export interface SuperbrainPipelineStep extends Omit<PipelineStep, "name"> {
  name: SuperbrainPipelineStepName;
}

export interface RuntimeSection {
  id: string;
  title: string;
  content: string;
  source: string;
}

export interface RuntimeRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  department: string;
  rationale: string;
}

export interface RuntimeRisk {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
}

export interface RuntimeOpportunity {
  id: string;
  title: string;
  impact: "High" | "Medium" | "Low";
  description: string;
  effort: string;
}

export interface RuntimeNextAction {
  id: string;
  title: string;
  owner: string;
  deadline: string;
}

export interface MockExecutiveDecision {
  id: string;
  title: string;
  description: string;
  priority: RuntimeRecommendation["priority"];
  impact: string;
  department: string;
  rationale: string;
  generatedAt: string;
}

export interface RuntimeResponse {
  id: string;
  query: string;
  tenantId: string;
  companyId: string;
  sections: RuntimeSection[];
  recommendations: RuntimeRecommendation[];
  risks: RuntimeRisk[];
  opportunities: RuntimeOpportunity[];
  nextActions: RuntimeNextAction[];
  summary: string;
  pipeline: SuperbrainPipelineStep[];
  decision: MockExecutiveDecision;
  confidence: number;
  totalDurationMs: number;
  generatedAt: string;
}

export interface SuperbrainRunInput {
  query: string;
  tenantId?: string;
  companyId?: string;
  userId?: string;
}
