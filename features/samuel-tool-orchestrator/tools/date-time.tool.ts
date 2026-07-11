/**
 * Date Time Tool (MOCK, Sprint 79) — devolve a data/hora atual do servidor
 * em diferentes formatos. Sem I/O externo (sem chamada de rede/relógio
 * externo) e sem qualquer dependência do Samuel.
 */
import { ToolExecutionError } from "../tool-execution-error";
import type { Tool, ToolExecutionContext } from "../types";

export type DateTimeFormat = "iso" | "unix" | "readable";

export type DateTimeToolInput = {
  format?: DateTimeFormat;
};

export type DateTimeToolOutput = {
  format: DateTimeFormat;
  value: string;
};

const FORMATS: ReadonlyArray<DateTimeFormat> = ["iso", "unix", "readable"];

export class DateTimeTool implements Tool<DateTimeToolInput, DateTimeToolOutput> {
  readonly name = "date-time";
  readonly description = "Devolve a data/hora atual do servidor em formato ISO, Unix (ms) ou legível.";
  readonly inputSchema = {
    format: "'iso' | 'unix' | 'readable' (opcional, default 'iso')",
  };

  async execute(context: ToolExecutionContext<DateTimeToolInput>): Promise<DateTimeToolOutput> {
    const format = context.input?.format ?? "iso";

    if (!FORMATS.includes(format)) {
      throw new ToolExecutionError(
        this.name,
        `Formato inválido: "${format}". Use um de: ${FORMATS.join(", ")}.`,
      );
    }

    const now = new Date();

    switch (format) {
      case "iso":
        return { format, value: now.toISOString() };
      case "unix":
        return { format, value: String(now.getTime()) };
      case "readable":
        return { format, value: now.toUTCString() };
    }
  }
}
