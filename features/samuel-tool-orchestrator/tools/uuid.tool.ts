/**
 * UUID Tool (MOCK, Sprint 79) — gera UUIDs v4 usando o módulo nativo
 * `node:crypto`. Sem dependências externas e sem qualquer conhecimento do
 * Samuel.
 */
import { randomUUID } from "node:crypto";

import { ToolExecutionError } from "../tool-execution-error";
import type { Tool, ToolExecutionContext } from "../types";

export type UUIDToolInput = {
  count?: number;
};

export type UUIDToolOutput = {
  uuids: string[];
};

const MAX_COUNT = 20;

export class UUIDTool implements Tool<UUIDToolInput, UUIDToolOutput> {
  readonly name = "uuid";
  readonly description = `Gera de 1 a ${MAX_COUNT} UUIDs v4.`;
  readonly inputSchema = {
    count: `number (opcional, default 1, máximo ${MAX_COUNT})`,
  };

  async execute(context: ToolExecutionContext<UUIDToolInput>): Promise<UUIDToolOutput> {
    const count = context.input?.count ?? 1;

    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
      throw new ToolExecutionError(
        this.name,
        `Parâmetro 'count' inválido: ${count}. Deve ser um inteiro entre 1 e ${MAX_COUNT}.`,
      );
    }

    return { uuids: Array.from({ length: count }, () => randomUUID()) };
  }
}
