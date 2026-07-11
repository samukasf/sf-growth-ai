/**
 * Contratos públicos do Samuel Tool Orchestrator (Sprint 79).
 *
 * IMPORTANTE (isolamento obrigatório): nenhum tipo aqui carrega qualquer
 * conceito específico do Samuel (RuntimeResponse, DecisionEngine, etc.).
 * `ToolExecutionContext` é deliberadamente genérico — é a única coisa que
 * uma `Tool` recebe, e nenhuma `Tool` pode importar `@/features/samuel-runtime`
 * ou qualquer outro módulo do Samuel. O Orchestrator é o único ponto que um
 * futuro chamador (ex.: uma fase do Samuel Runtime) precisará conhecer.
 */

/** Contexto de execução passado a toda `Tool` — genérico, nunca acoplado ao Samuel. */
export type ToolExecutionContext<TInput = Record<string, unknown>> = {
  /** Identificador único desta chamada, gerado pelo Orchestrator se não informado. */
  requestId: string;
  organizationId?: string;
  companyId?: string;
  /** Parâmetros de entrada específicos da Tool sendo executada. */
  input: TInput;
  /** Timestamp ISO de quando a execução foi solicitada. */
  requestedAt: string;
};

export type ToolResultStatus = "success" | "error";

/** Resultado normalizado de qualquer execução de Tool — sucesso ou erro, nunca uma exceção. */
export type ToolResult<TOutput = unknown> = {
  toolName: string;
  status: ToolResultStatus;
  output?: TOutput;
  error?: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
};

/**
 * Contrato que toda Tool deve implementar. Uma Tool é livre para lançar
 * qualquer erro (idealmente `ToolExecutionError`) em `execute()` — é
 * responsabilidade do `ToolOrchestrator` capturar e normalizar em
 * `ToolResult`, nunca da própria Tool.
 */
export interface Tool<TInput = Record<string, unknown>, TOutput = unknown> {
  readonly name: string;
  readonly description: string;
  /**
   * Descrição legível das chaves esperadas em `input` (documentação para
   * humanos/UIs). Não é validada estruturalmente pelo Orchestrator nesta
   * sprint — ponto de extensão para uma sprint futura de validação.
   */
  readonly inputSchema?: Record<string, string>;
  execute(context: ToolExecutionContext<TInput>): Promise<TOutput>;
}

/**
 * Registry de Tools. Implementações devem ser imutáveis: a lista de Tools é
 * recebida uma única vez (construtor/factory) e nunca alterada depois —
 * mesma regra já aplicada ao Samuel Intent Router (Sprint 75), para evitar
 * contaminação entre testes e comportamento diferente entre requests
 * concorrentes.
 */
export interface ToolRegistry {
  readonly tools: ReadonlyArray<Tool>;
  get(name: string): Tool | undefined;
  has(name: string): boolean;
  list(): ReadonlyArray<{ name: string; description: string }>;
}
