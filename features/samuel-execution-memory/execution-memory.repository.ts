import { supabase } from "@/lib/supabase/client";

import type { ExecutionMemoryRecord } from "./types";

/**
 * Persiste um registro de execução do Samuel na tabela
 * `samuel_execution_memory`. Nunca lança exceção — uma falha de gravação
 * (banco fora do ar, schema desalinhado, etc.) é apenas logada, para que a
 * resposta do Samuel ao usuário jamais dependa da Execution Memory.
 */
export async function saveExecutionMemory(record: ExecutionMemoryRecord): Promise<void> {
  if (process.env.SAMUEL_EXECUTION_MEMORY_ENABLED === "false") {
    return;
  }

  try {
    const { error } = await supabase.from("samuel_execution_memory").insert({
      id: record.executionId,
      organization_id: record.organizationId,
      company_id: record.companyId,
      user_id: record.userId,
      provider: record.provider,
      model: record.model,
      operation: record.operation,
      context: record.context,
      memories_used: record.memoriesUsed,
      decision: record.decision,
      plan: record.plan,
      tools_executed: record.toolsExecuted,
      final_response: record.finalResponse,
      input_tokens: record.inputTokens,
      output_tokens: record.outputTokens,
      estimated_cost: record.estimatedCost,
      execution_time_ms: record.executionTimeMs,
      status: record.status,
      error: record.error,
      created_at: record.timestamp,
    });

    if (error) {
      console.warn("[samuel-execution-memory] Falha ao persistir execução:", error.message);
    }
  } catch (error) {
    console.warn(
      "[samuel-execution-memory] Falha ao persistir execução:",
      error instanceof Error ? error.message : error,
    );
  }
}
