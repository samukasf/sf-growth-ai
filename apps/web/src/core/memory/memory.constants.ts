import type { MemoryImportance, MemoryType } from "./memory.types";

export const MEMORY_TYPES: readonly MemoryType[] = [
  "NOTE",
  "CONVERSATION",
  "DOCUMENT",
  "CUSTOMER",
  "PROJECT",
  "TASK",
  "MEETING",
  "DISCOVERY",
  "ASSESSMENT",
  "MARKETING",
  "FINANCIAL",
  "STRATEGY",
] as const;

export const MEMORY_IMPORTANCE_LEVELS: readonly MemoryImportance[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const MEMORY_IMPORTANCE_WEIGHT: Record<MemoryImportance, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export const DEFAULT_SEARCH_LIMIT = 20;
export const DEFAULT_RANK_LIMIT = 10;
export const DEFAULT_SUMMARY_TOP_TAGS = 5;
