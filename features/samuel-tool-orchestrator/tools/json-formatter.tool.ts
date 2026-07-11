/**
 * JSON Formatter Tool (MOCK, Sprint 79) — recebe um texto JSON e devolve
 * sua versão formatada (pretty-printed). Sem I/O externo e sem qualquer
 * conhecimento do Samuel.
 */
import { ToolExecutionError } from "../tool-execution-error";
import type { Tool, ToolExecutionContext } from "../types";

export type JSONFormatterToolInput = {
  raw: string;
  indent?: number;
};

export type JSONFormatterToolOutput = {
  formatted: string;
};

const DEFAULT_INDENT = 2;
const MAX_INDENT = 10;

export class JSONFormatterTool implements Tool<JSONFormatterToolInput, JSONFormatterToolOutput> {
  readonly name = "json-formatter";
  readonly description = "Valida e formata (pretty-print) um texto JSON.";
  readonly inputSchema = {
    raw: "string — texto JSON a ser formatado",
    indent: `number (opcional, default ${DEFAULT_INDENT}, máximo ${MAX_INDENT})`,
  };

  async execute(
    context: ToolExecutionContext<JSONFormatterToolInput>,
  ): Promise<JSONFormatterToolOutput> {
    const { raw } = context.input ?? {};
    const indent = context.input?.indent ?? DEFAULT_INDENT;

    if (typeof raw !== "string" || raw.trim().length === 0) {
      throw new ToolExecutionError(this.name, "Parâmetro 'raw' deve ser uma string JSON não vazia.");
    }

    if (!Number.isInteger(indent) || indent < 0 || indent > MAX_INDENT) {
      throw new ToolExecutionError(
        this.name,
        `Parâmetro 'indent' inválido: ${indent}. Deve ser um inteiro entre 0 e ${MAX_INDENT}.`,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new ToolExecutionError(this.name, `JSON inválido: ${reason}`, error);
    }

    return { formatted: JSON.stringify(parsed, null, indent) };
  }
}
