/**
 * Erro dedicado que uma `Tool` pode lançar em `execute()` para descrever uma
 * falha de forma estruturada (nome da tool + causa original). O
 * `ToolOrchestrator` trata este erro exatamente como qualquer outro —
 * captura e normaliza em `ToolResult.error` — mas ele existe para dar às
 * Tools um jeito consistente de reportar falhas de negócio (ex.: divisão
 * por zero, JSON inválido) em vez de erros genéricos.
 */
export class ToolExecutionError extends Error {
  readonly toolName: string;
  readonly cause?: unknown;

  constructor(toolName: string, message: string, cause?: unknown) {
    super(message);
    this.name = "ToolExecutionError";
    this.toolName = toolName;
    this.cause = cause;
  }
}
