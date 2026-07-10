import type {
  CompanyAnalysisPipelineResult,
  CompanyAnalysisRuntimeResponse,
  DecisionAnalysisData,
} from "./company-analysis.types";
import type { CompanyAnalysisPipelineStep } from "./company-analysis.types";

export function buildCompanyAnalysisSummary(
  companyName: string,
  decision: DecisionAnalysisData,
  confidence: number,
): string {
  return [
    `${companyName}: análise executiva concluída com ${confidence}% de confiança.`,
    `${decision.strengths.length} forças, ${decision.weaknesses.length} fraquezas identificadas.`,
    `Prioridade: ${decision.primaryDecision}.`,
    decision.rationale,
  ].join(" ");
}

export function mapToRuntimeResponse(
  result: CompanyAnalysisPipelineResult,
  pipeline: CompanyAnalysisPipelineStep[],
): CompanyAnalysisRuntimeResponse {
  const { decision, actionPlan, confidence, companyName, tenantId, companyId, totalDurationMs } =
    result;

  return {
    id: `company-analysis-${Date.now()}`,
    companyName,
    tenantId,
    companyId,
    summary: buildCompanyAnalysisSummary(companyName, decision, confidence),
    strengths: decision.strengths,
    weaknesses: decision.weaknesses,
    opportunities: decision.opportunities,
    risks: decision.risks,
    recommendations: decision.recommendations,
    priorityActions: actionPlan.priorityActions,
    confidence,
    pipeline,
    totalDurationMs,
    generatedAt: new Date().toISOString(),
  };
}

export function mapSuperbrainSteps(
  steps: CompanyAnalysisPipelineResult["superbrainSteps"],
): CompanyAnalysisPipelineStep[] {
  return steps.map((step) => ({ ...step }));
}

export function appendPipelineStep(
  pipeline: CompanyAnalysisPipelineStep[],
  step: CompanyAnalysisPipelineStep,
): CompanyAnalysisPipelineStep[] {
  return [...pipeline, step];
}
