/**
 * ToolOrchestrator (Sprint 79) — único ponto de entrada para executar
 * Tools. Nunca lança: toda chamada a `execute()` devolve um `ToolResult`,
 * sucesso ou erro, mesmo padrão de resiliência já usado no coletor de
 * pareceres do Executive Council (Sprint 78).
 *
 * Este orchestrator não conhece o Samuel — e o Samuel, quando vier a
 * consumi-lo numa sprint futura, não precisará conhecer nenhuma Tool
 * concreta, apenas esta classe (via `createToolOrchestrator`).
 */
import { DEFAULT_TOOLS } from "./tools";
import { createToolRegistry } from "./tool-registry";
import type { Tool, ToolExecutionContext, ToolRegistry, ToolResult } from "./types";

function generateRequestId(): string {
  return `toolreq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function serializeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export type ToolExecutionContextOverrides = Partial<
  Pick<ToolExecutionContext, "requestId" | "organizationId" | "companyId">
>;

export class ToolOrchestrator {
  constructor(private readonly registry: ToolRegistry) {}

  async execute<TInput = Record<string, unknown>, TOutput = unknown>(
    toolName: string,
    input: TInput,
    overrides: ToolExecutionContextOverrides = {},
  ): Promise<ToolResult<TOutput>> {
    const startedAt = new Date();

    const tool = this.registry.get(toolName) as Tool<TInput, TOutput> | undefined;
    if (!tool) {
      return this.buildResult<TOutput>(toolName, startedAt, {
        error: `Tool "${toolName}" não encontrada no registry.`,
      });
    }

    const context: ToolExecutionContext<TInput> = {
      requestId: overrides.requestId ?? generateRequestId(),
      organizationId: overrides.organizationId,
      companyId: overrides.companyId,
      input,
      requestedAt: startedAt.toISOString(),
    };

    try {
      const output = await tool.execute(context);
      return this.buildResult<TOutput>(toolName, startedAt, { output });
    } catch (error) {
      return this.buildResult<TOutput>(toolName, startedAt, { error: serializeError(error) });
    }
  }

  /** Permite a um chamador descobrir as Tools plugadas sem conhecer suas classes concretas. */
  listAvailableTools(): ReadonlyArray<{ name: string; description: string }> {
    return this.registry.list();
  }

  private buildResult<TOutput>(
    toolName: string,
    startedAt: Date,
    outcome: { output?: TOutput; error?: string },
  ): ToolResult<TOutput> {
    const completedAtDate = new Date();
    return {
      toolName,
      status: outcome.error ? "error" : "success",
      output: outcome.output,
      error: outcome.error,
      startedAt: startedAt.toISOString(),
      completedAt: completedAtDate.toISOString(),
      durationMs: completedAtDate.getTime() - startedAt.getTime(),
    };
  }
}

export type CreateToolOrchestratorOptions = {
  /** Tools a injetar. Default: `DEFAULT_TOOLS` (mocks da Sprint 79 + Supabase Query Tool da Sprint 85). Plugável — passe qualquer lista. */
  tools?: ReadonlyArray<Tool>;
  /** Alternativa a `tools`: injetar um `ToolRegistry` já construído. */
  registry?: ToolRegistry;
};

/** Factory — cada chamada produz uma instância nova e independente, sem estado compartilhado. */
export function createToolOrchestrator(
  options: CreateToolOrchestratorOptions = {},
): ToolOrchestrator {
  const registry = options.registry ?? createToolRegistry(options.tools ?? DEFAULT_TOOLS);
  return new ToolOrchestrator(registry);
}
