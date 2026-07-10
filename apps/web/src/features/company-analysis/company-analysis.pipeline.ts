import { OrchestratorService } from "../../core/orchestrator/orchestrator.service";
import {
  DEMO_COMPANY_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID,
  createMockContextProviders,
  createMockExecutiveCouncilPort,
  createMockMemoryRepository,
} from "../../core/superbrain/superbrain.mocks";
import {
  appendPipelineStep,
  mapSuperbrainSteps,
  mapToRuntimeResponse,
} from "./company-analysis.mapper";
import {
  generateActionPlan,
  generateDecisionAnalysis,
  resolveCompanyBrainSnapshot,
} from "./decision-engine.mock";
import type {
  CompanyAnalysisInput,
  CompanyAnalysisPipelineStep,
  CompanyAnalysisRuntimeResponse,
} from "./company-analysis.types";
import { createMockCompanyBrainPort } from "./company-analysis.mocks";

const ANALYSIS_QUERY = "Analise minha empresa.";

function createPipelineStep(
  name: CompanyAnalysisPipelineStep["name"],
  status: CompanyAnalysisPipelineStep["status"],
  durationMs: number,
  result: Record<string, unknown>,
): CompanyAnalysisPipelineStep {
  return { name, status, durationMs, result };
}

export async function runCompanyAnalysisPipeline(
  input: CompanyAnalysisInput,
): Promise<CompanyAnalysisRuntimeResponse> {
  const started = performance.now();
  const tenantId = input.tenantId ?? DEMO_TENANT_ID;
  const companyId = input.companyId ?? DEMO_COMPANY_ID;
  const userId = input.userId ?? DEMO_USER_ID;
  const companyName = input.companyName.trim();

  const brainSnapshot = resolveCompanyBrainSnapshot(companyName, tenantId, companyId);

  const orchestrator = new OrchestratorService({
    memoryRepository: createMockMemoryRepository(),
    contextProviders: createMockContextProviders(),
    companyBrain: createMockCompanyBrainPort(brainSnapshot),
    executiveCouncil: createMockExecutiveCouncilPort(),
    llmProvider: null,
  });

  const orchestratorResponse = await orchestrator.processMessage({
    tenantId,
    companyId,
    userId,
    content: ANALYSIS_QUERY,
  });

  let pipeline: CompanyAnalysisPipelineStep[] = mapSuperbrainSteps(orchestratorResponse.steps);

  const decisionStarted = performance.now();
  const decision = generateDecisionAnalysis(orchestratorResponse, companyName);
  const decisionDurationMs = Math.round(performance.now() - decisionStarted);

  pipeline = appendPipelineStep(
    pipeline,
    createPipelineStep("load_decision", "success", decisionDurationMs, {
      decisionId: decision.id,
      primaryDecision: decision.primaryDecision,
      strengths: decision.strengths.length,
      weaknesses: decision.weaknesses.length,
    }),
  );

  const plannerStarted = performance.now();
  const actionPlan = generateActionPlan(decision);
  const plannerDurationMs = Math.round(performance.now() - plannerStarted);

  pipeline = appendPipelineStep(
    pipeline,
    createPipelineStep("load_action_planner", "success", plannerDurationMs, {
      planId: actionPlan.id,
      actionCount: actionPlan.priorityActions.length,
    }),
  );

  const confidence = orchestratorResponse.confidence;
  const totalDurationMs = Math.round(performance.now() - started);

  const buildStarted = performance.now();
  const response = mapToRuntimeResponse(
    {
      superbrainSteps: orchestratorResponse.steps,
      decision,
      actionPlan,
      confidence,
      companyName,
      tenantId,
      companyId,
      totalDurationMs,
    },
    pipeline,
  );
  const buildDurationMs = Math.round(performance.now() - buildStarted);

  pipeline = appendPipelineStep(
    pipeline,
    createPipelineStep("build_response", "success", buildDurationMs, {
      responseId: response.id,
      confidence: response.confidence,
    }),
  );

  return {
    ...response,
    pipeline,
    totalDurationMs: Math.round(performance.now() - started),
  };
}
