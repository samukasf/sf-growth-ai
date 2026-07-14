import { createToolOrchestrator } from "@/features/samuel-tool-orchestrator";

import { areDependenciesMet, resolveStepInput } from "./input-resolver";
import { planMultiToolTask } from "./task-planner";

import type {
  MultiToolTaskExecutionContext,
  MultiToolTaskExecutionResult,
  MultiToolTaskPlan,
  MultiToolTaskStepResult,
  StepOutputContext,
} from "./types";

/** Kill-switch da Sprint 90 — desliga execução multi-tool sem deploy. */
export function isMultiToolTaskOrchestratorEnabled(): boolean {
  return process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED !== "false";
}

function resolveActionId(input: Record<string, unknown>): string | undefined {
  const actionId = input.actionId ?? input.queryId;
  return typeof actionId === "string" ? actionId : undefined;
}

function computeOverallStatus(steps: MultiToolTaskStepResult[]): MultiToolTaskExecutionResult["overallStatus"] {
  if (steps.length === 0) return "none";
  const successes = steps.filter((step) => step.status === "success").length;
  const errors = steps.filter((step) => step.status === "error").length;
  if (successes === steps.length) return "success";
  if (successes > 0 && (errors > 0 || steps.some((step) => step.status === "skipped"))) return "partial";
  if (errors > 0) return "error";
  return "none";
}

export class MultiToolTaskOrchestrator {
  async execute(
    plan: Extract<MultiToolTaskPlan, { selected: true }>,
    context: MultiToolTaskExecutionContext,
  ): Promise<MultiToolTaskExecutionResult> {
    const orchestrator = createToolOrchestrator();
    const startedAt = Date.now();
    const stepContext: Record<string, StepOutputContext> = {};
    const results: MultiToolTaskStepResult[] = [];

    for (const step of plan.steps) {
      if (!areDependenciesMet(step.dependsOn, stepContext)) {
        const skipped: MultiToolTaskStepResult = {
          id: step.id,
          toolName: step.toolName,
          actionId: resolveActionId(step.input),
          reason: step.reason,
          input: step.input,
          status: "skipped",
          error: "Dependência anterior não concluída com sucesso.",
        };
        results.push(skipped);
        stepContext[step.id] = { status: "skipped" };
        continue;
      }

      const resolvedInput = resolveStepInput(step.id, step.toolName, step.input, stepContext);
      const toolResult = await orchestrator.execute(step.toolName, resolvedInput, {
        organizationId: context.organizationId,
        companyId: context.companyId,
      });

      const stepResult: MultiToolTaskStepResult = {
        id: step.id,
        toolName: step.toolName,
        actionId: resolveActionId(resolvedInput),
        reason: step.reason,
        input: resolvedInput,
        status: toolResult.status === "success" ? "success" : "error",
        output: toolResult.output,
        error: toolResult.error,
        durationMs: toolResult.durationMs,
      };

      results.push(stepResult);
      stepContext[step.id] = {
        status: stepResult.status,
        output: toolResult.output,
      };
    }

    return {
      enabled: true,
      attempted: true,
      overallStatus: computeOverallStatus(results),
      summary: plan.summary,
      steps: results,
      totalDurationMs: Date.now() - startedAt,
    };
  }
}

export function createMultiToolTaskOrchestrator(): MultiToolTaskOrchestrator {
  return new MultiToolTaskOrchestrator();
}

export { planMultiToolTask };
