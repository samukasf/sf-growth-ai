import type { CompanyAnalysisPipelineStep, CompanyAnalysisRuntimeResponse } from "./company-analysis.types";

const STEP_LABELS: Record<CompanyAnalysisPipelineStep["name"], string> = {
  load_memory: "Memory Engine",
  load_context: "Context Engine",
  load_company_brain: "Company Brain",
  load_executive_council: "Executive Council",
  merge_context: "Merge Context",
  build_runtime: "Build Runtime",
  prepare_response: "Prepare Response",
  load_decision: "Decision Engine",
  load_action_planner: "Action Planner",
  build_response: "Response Builder",
};

export function getPipelineStepLabel(step: CompanyAnalysisPipelineStep["name"]): string {
  return STEP_LABELS[step] ?? step;
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export function formatConfidence(confidence: number): string {
  return `${confidence}%`;
}

export interface CompanyAnalysisViewModel {
  headline: string;
  confidenceLabel: string;
  durationLabel: string;
  pipelineSteps: Array<{
    name: CompanyAnalysisPipelineStep["name"];
    label: string;
    status: CompanyAnalysisPipelineStep["status"];
    durationLabel: string;
  }>;
}

export function presentCompanyAnalysis(
  response: CompanyAnalysisRuntimeResponse,
): CompanyAnalysisViewModel {
  return {
    headline: `Análise — ${response.companyName}`,
    confidenceLabel: formatConfidence(response.confidence),
    durationLabel: formatDuration(response.totalDurationMs),
    pipelineSteps: response.pipeline.map((step) => ({
      name: step.name,
      label: getPipelineStepLabel(step.name),
      status: step.status,
      durationLabel: formatDuration(step.durationMs),
    })),
  };
}
