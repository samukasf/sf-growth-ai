import type { ContextPriority, ContextSource } from "./context.types";

export const ALL_CONTEXT_SOURCES: readonly ContextSource[] = [
  "MEMORY",
  "COMPANY_BRAIN",
  "PROJECTS",
  "CLIENTS",
  "AGENDA",
  "FINANCIAL",
  "MARKETING",
  "DOCUMENTS",
  "CONVERSATIONS",
  "EXECUTIVE_COUNCIL",
] as const;

export const CONTEXT_PRIORITY_LEVELS: readonly ContextPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const CONTEXT_PRIORITY_WEIGHT: Record<ContextPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export const DEFAULT_CONTEXT_LIMIT = 50;
export const DEFAULT_SUMMARY_TOP_TAGS = 5;
