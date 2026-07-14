import { CalculatorTool } from "./calculator.tool";
import { DateTimeTool } from "./date-time.tool";
import { GmailTool } from "./gmail.tool";
import { JSONFormatterTool } from "./json-formatter.tool";
import { SupabaseQueryTool } from "./supabase-query.tool";
import { UUIDTool } from "./uuid.tool";
import { CalendarTool } from "@/features/google-calendar";
import { ContactsTool } from "@/features/google-contacts";
import { DriveTool } from "@/features/google-drive";

import type { Tool } from "../types";

export { CalculatorTool } from "./calculator.tool";
export type { CalculatorOperator, CalculatorToolInput, CalculatorToolOutput } from "./calculator.tool";

export { DateTimeTool } from "./date-time.tool";
export type { DateTimeFormat, DateTimeToolInput, DateTimeToolOutput } from "./date-time.tool";

export { UUIDTool } from "./uuid.tool";
export type { UUIDToolInput, UUIDToolOutput } from "./uuid.tool";

export { JSONFormatterTool } from "./json-formatter.tool";
export type { JSONFormatterToolInput, JSONFormatterToolOutput } from "./json-formatter.tool";

export { SupabaseQueryTool } from "./supabase-query.tool";
export type {
  SupabaseQueryId,
  SupabaseQueryToolInput,
  SupabaseQueryToolOutput,
} from "./supabase-query.tool";

export { GmailTool } from "./gmail.tool";
export type { GmailActionId, GmailToolInput, GmailToolOutput } from "./gmail.tool";

export { CalendarTool } from "@/features/google-calendar";
export type { CalendarActionId, CalendarToolInput, CalendarToolOutput } from "@/features/google-calendar";

export { ContactsTool } from "@/features/google-contacts";
export type { ContactsActionId, ContactsToolInput, ContactsToolOutput } from "@/features/google-contacts";

export { DriveTool } from "@/features/google-drive";
export type { DriveActionId, DriveToolInput, DriveToolOutput } from "@/features/google-drive";

/**
 * As 4 Tools MOCK originais da Sprint 79 — nenhuma faz I/O externo. Mantido
 * inalterado para não quebrar quem já depende exatamente destas 4.
 */
export const MOCK_TOOLS: Tool[] = [
  new CalculatorTool(),
  new DateTimeTool(),
  new UUIDTool(),
  new JSONFormatterTool(),
];

/**
 * Tools oficiais usadas como default por `createToolOrchestrator()`
 * (Sprint 85/87): as 4 mocks originais + Supabase Query Tool + Gmail Tool.
 */
export const DEFAULT_TOOLS: Tool[] = [
  ...MOCK_TOOLS,
  new SupabaseQueryTool(),
  new GmailTool(),
  new CalendarTool(),
  new ContactsTool(),
  new DriveTool(),
];
