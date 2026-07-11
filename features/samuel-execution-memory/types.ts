import type { RunSamuelRuntimeInput } from "@/features/samuel-runtime";

export type ExecutionStatus = "success" | "error";

/** Registro persistido para cada execução do Samuel Runtime. */
export type ExecutionMemoryRecord = {
  executionId: string;
  timestamp: string;
  organizationId: string;
  companyId: string;
  userId: string | null;
  provider: string | null;
  model: string | null;
  operation: string | null;
  context: unknown;
  memoriesUsed: unknown;
  decision: unknown;
  plan: unknown;
  /**
   * Ferramenta planejada/executada pelo Tool Orchestrator nesta execução
   * (Sprint 80) — espelha `RuntimeResponse["tooling"]`. Antes da Sprint 80
   * este campo guardava o `pipeline` de fases como placeholder; passou a
   * refletir o nome real da coluna (`tools_executed`) agora que o Tool
   * Orchestrator está integrado ao Samuel Runtime.
   */
  toolsExecuted: unknown;
  finalResponse: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  executionTimeMs: number;
  status: ExecutionStatus;
  error: string | null;
};

export type RunSamuelRuntimeWithExecutionMemoryInput = RunSamuelRuntimeInput & {
  /**
   * userId de fallback, aceito apenas fora de produção (ex.: dev/testes
   * manuais). Nunca é a fonte oficial — a fonte oficial é a sessão
   * autenticada resolvida via `authorizationHeader`. Ver
   * `resolve-execution-user.ts`.
   */
  userId?: string;
  /** Header `Authorization` da requisição HTTP original, se houver. */
  authorizationHeader?: string | null;
};
