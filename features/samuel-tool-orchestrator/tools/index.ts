import { CalculatorTool } from "./calculator.tool";
import { DateTimeTool } from "./date-time.tool";
import { JSONFormatterTool } from "./json-formatter.tool";
import { UUIDTool } from "./uuid.tool";

import type { Tool } from "../types";

export { CalculatorTool } from "./calculator.tool";
export type { CalculatorOperator, CalculatorToolInput, CalculatorToolOutput } from "./calculator.tool";

export { DateTimeTool } from "./date-time.tool";
export type { DateTimeFormat, DateTimeToolInput, DateTimeToolOutput } from "./date-time.tool";

export { UUIDTool } from "./uuid.tool";
export type { UUIDToolInput, UUIDToolOutput } from "./uuid.tool";

export { JSONFormatterTool } from "./json-formatter.tool";
export type { JSONFormatterToolInput, JSONFormatterToolOutput } from "./json-formatter.tool";

/**
 * As 4 Tools MOCK oficiais desta sprint — usadas como default por
 * `createToolOrchestrator()`. Nenhuma faz I/O externo (Email, Banco,
 * Internet, Supabase ficam fora do escopo desta sprint).
 */
export const MOCK_TOOLS: Tool[] = [
  new CalculatorTool(),
  new DateTimeTool(),
  new UUIDTool(),
  new JSONFormatterTool(),
];
