import { randomUUID } from "node:crypto";

import { runSamuelRuntime, type RuntimeResponse } from "@/features/samuel-runtime";

import { saveExecutionMemory } from "./execution-memory.repository";
import { resolveExecutionUserId } from "./resolve-execution-user";
import type { ExecutionMemoryRecord, RunSamuelRuntimeWithExecutionMemoryInput } from "./types";

/**
 * Wrapper de observabilidade em torno do Samuel Runtime.
 *
 * Chama `runSamuelRuntime` sem alterá-lo nem interpretar seu resultado —
 * apenas registra o que aconteceu (Execution Memory) e devolve exatamente
 * o mesmo `RuntimeResponse`. Se `runSamuelRuntime` lançar, o erro é
 * registrado e relançado sem modificação, preservando o comportamento de
 * erro que a rota HTTP já tem hoje.
 *
 * A gravação nunca pode quebrar ou alterar a resposta do Samuel: qualquer
 * falha de persistência é tratada dentro de `saveExecutionMemory`.
 */
export async function runSamuelRuntimeWithExecutionMemory(
  input: RunSamuelRuntimeWithExecutionMemoryInput,
): Promise<RuntimeResponse> {
  const executionId = randomUUID();
  const startedAt = Date.now();
  const organizationId = input.organizationId ?? "default-org";
  const companyId = input.companyId ?? "default-company";

  const userId = await resolveExecutionUserId({
    authorizationHeader: input.authorizationHeader,
    fallbackUserId: input.userId,
  });

  try {
    const result = await runSamuelRuntime(input);
    const executionTimeMs = Date.now() - startedAt;

    const record: ExecutionMemoryRecord = {
      executionId,
      timestamp: result.generatedAt,
      organizationId,
      companyId,
      userId,
      provider: result.aiGateway.providerId ?? null,
      model: result.aiGateway.model ?? null,
      operation: result.aiGateway.operation ?? null,
      context: result.context,
      memoriesUsed: result.memory,
      decision: result.decision,
      plan: {
        summary: result.response.actionPlanSummary,
        actions: result.response.actions,
      },
      toolsExecuted: result.tooling,
      finalResponse: result.response.narrative,
      inputTokens: result.aiGateway.promptTokens ?? null,
      outputTokens: result.aiGateway.completionTokens ?? null,
      estimatedCost: result.aiGateway.estimatedCostUsd ?? null,
      executionTimeMs,
      status: "success",
      error: null,
    };

    await saveExecutionMemory(record);

    return result;
  } catch (error) {
    const executionTimeMs = Date.now() - startedAt;

    const record: ExecutionMemoryRecord = {
      executionId,
      timestamp: new Date().toISOString(),
      organizationId,
      companyId,
      userId,
      provider: null,
      model: null,
      operation: null,
      context: null,
      memoriesUsed: null,
      decision: null,
      plan: null,
      toolsExecuted: null,
      finalResponse: null,
      inputTokens: null,
      outputTokens: null,
      estimatedCost: null,
      executionTimeMs,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };

    await saveExecutionMemory(record);

    throw error;
  }
}
