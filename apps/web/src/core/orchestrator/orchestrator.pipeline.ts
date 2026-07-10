import type { ContextService } from "../context/context.service";
import type { MemoryService } from "../memory/memory.service";
import {
  buildRuntimeContext,
  classifyQueryIntent,
  mergeExecutionContext,
  shouldConsultCouncil,
} from "./orchestrator.context";
import { OrchestratorLogger, createOrchestratorLogger } from "./orchestrator.logger";
import { prepareOrchestratorResponse } from "./orchestrator.response";
import type {
  CompanyBrainPort,
  ExecutiveCouncilPort,
  ExecutionContext,
  OrchestratorDependencies,
  OrchestratorResponse,
  PipelineStep,
  PipelineStepName,
  UserMessage,
} from "./orchestrator.types";

async function runStep<T>(
  name: PipelineStepName,
  fn: () => Promise<T>,
  logContext: { tenantId: string; companyId: string },
  logger: OrchestratorLogger,
  summarize: (value: T) => Record<string, unknown>,
): Promise<{ value: T; step: PipelineStep }> {
  const started = performance.now();
  try {
    const value = await fn();
    const durationMs = Math.round(performance.now() - started);
    const result = summarize(value);
    logger.logStep(name, "success", durationMs, result, logContext);
    return {
      value,
      step: { name, status: "success", durationMs, result },
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.logStep(name, "failed", durationMs, {}, logContext, message);
    return {
      value: undefined as T,
      step: { name, status: "failed", durationMs, result: {}, error: message },
    };
  }
}

async function runSkippedStep(
  name: PipelineStepName,
  reason: string,
  logContext: { tenantId: string; companyId: string },
  logger: OrchestratorLogger,
): Promise<PipelineStep> {
  const result = { skipped: true, reason };
  logger.logStep(name, "skipped", 0, result, logContext);
  return { name, status: "skipped", durationMs: 0, result };
}

export async function executeOrchestratorPipeline(
  message: UserMessage,
  deps: OrchestratorDependencies,
): Promise<OrchestratorResponse> {
  const logger =
    deps.logger instanceof OrchestratorLogger
      ? deps.logger
      : createOrchestratorLogger();

  const logContext = { tenantId: message.tenantId, companyId: message.companyId };
  const intent = classifyQueryIntent(message.content);
  const steps: PipelineStep[] = [];

  const execution: ExecutionContext = {
    message,
    intent,
    memoryResults: [],
    memorySummary: null,
    contextOutput: null,
    companyBrain: null,
    executiveCouncil: null,
    steps: [],
  };

  const memoryStep = await runStep(
    "load_memory",
    () => loadMemory(deps.memoryService, message),
    logContext,
    logger,
    (value) => ({
      resultCount: value.results.length,
      totalMemories: value.summary.totalMemories,
    }),
  );
  steps.push(memoryStep.step);
  if (memoryStep.step.status === "success") {
    execution.memoryResults = memoryStep.value.results;
    execution.memorySummary = memoryStep.value.summary;
  }

  const contextStep = await runStep(
    "load_context",
    () => loadContext(deps.contextService, message),
    logContext,
    logger,
    (value) => ({
      fragmentCount: value.prioritizedFragments.length,
      sources: Object.keys(value.summary.bySource),
    }),
  );
  steps.push(contextStep.step);
  if (contextStep.step.status === "success") {
    execution.contextOutput = contextStep.value;
  }

  const brainStep = await runStep(
    "load_company_brain",
    () => deps.companyBrain.loadSnapshot(message.tenantId, message.companyId),
    logContext,
    logger,
    (value) => ({
      companyName: value.companyName,
      growthScore: value.growthScore ?? null,
    }),
  );
  steps.push(brainStep.step);
  if (brainStep.step.status === "success") {
    execution.companyBrain = brainStep.value;
  }

  if (shouldConsultCouncil(intent)) {
    const councilStep = await runStep(
      "load_executive_council",
      () =>
        deps.executiveCouncil.consult({
          tenantId: message.tenantId,
          companyId: message.companyId,
          topic: intent.intent,
          query: message.content,
        }),
      logContext,
      logger,
      (value) => ({
        consulted: value !== null,
        opinionCount: value?.opinions.length ?? 0,
        consensus: value?.consensus ?? false,
      }),
    );
    steps.push(councilStep.step);
    if (councilStep.step.status === "success") {
      execution.executiveCouncil = councilStep.value;
    }
  } else {
    steps.push(
      await runSkippedStep(
        "load_executive_council",
        "Council not required for this intent",
        logContext,
        logger,
      ),
    );
  }

  const mergeStep = await runStep(
    "merge_context",
    async () => mergeExecutionContext(execution),
    logContext,
    logger,
    (value) => ({ mergedFragmentCount: value.mergedFragmentCount }),
  );
  steps.push(mergeStep.step);

  const runtimeStep = await runStep(
    "build_runtime",
    async () => {
      const merged = mergeExecutionContext(execution);
      return buildRuntimeContext(
        message,
        execution,
        merged.mergedFragmentCount,
        merged.allFragments,
      );
    },
    logContext,
    logger,
    (value) => ({
      runtimeId: value.id,
      mergedFragmentCount: value.mergedFragmentCount,
      llmReady: value.llmPayload.fragments.length > 0,
    }),
  );
  steps.push(runtimeStep.step);

  const runtime = runtimeStep.value;

  const responseStep = await runStep(
    "prepare_response",
    async () => prepareOrchestratorResponse(message, runtime, steps, null),
    logContext,
    logger,
    (value) => ({
      responseId: value.id,
      confidence: value.confidence,
      intent: value.intent.intent,
    }),
  );
  steps.push(responseStep.step);

  execution.steps = steps;
  return responseStep.value;
}

async function loadMemory(
  memoryService: MemoryService,
  message: UserMessage,
) {
  const [results, summary] = await Promise.all([
    memoryService.search({
      tenantId: message.tenantId,
      companyId: message.companyId,
      query: message.content,
    }),
    memoryService.summarize(message.tenantId, message.companyId),
  ]);
  return { results, summary };
}

async function loadContext(
  contextService: ContextService,
  message: UserMessage,
) {
  return contextService.buildOutput({
    tenantId: message.tenantId,
    companyId: message.companyId,
    query: message.content,
  });
}

export function createNoopCompanyBrainPort(): CompanyBrainPort {
  return {
    async loadSnapshot(tenantId, companyId) {
      return {
        tenantId,
        companyId,
        companyName: "Company",
        growthScore: 642,
        health: { sales: 45, marketing: 42, operations: 72 },
        profile: {},
        generatedAt: new Date().toISOString(),
      };
    },
  };
}

export function createNoopExecutiveCouncilPort(): ExecutiveCouncilPort {
  return {
    async consult({ tenantId, companyId, topic, query }) {
      return {
        sessionId: `council-${Date.now()}`,
        tenantId,
        companyId,
        topic,
        opinions: [
          {
            executiveId: "cmo",
            role: "CMO",
            opinion: `Análise preliminar para: ${query}`,
          },
        ],
        consensus: true,
        summary: `Conselho consultado sobre ${topic}`,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}
