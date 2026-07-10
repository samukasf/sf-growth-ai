import {
  DEFAULT_RANK_LIMIT,
  MEMORY_IMPORTANCE_WEIGHT,
} from "./memory.constants";
import type { Memory, MemoryImportance, MemoryRankOptions } from "./memory.types";

function importanceWeight(importance: MemoryImportance): number {
  return MEMORY_IMPORTANCE_WEIGHT[importance];
}

function recencyScore(updatedAt: string): number {
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - ageDays / 365);
}

function computeRankScore(memory: Memory): number {
  return importanceWeight(memory.importance) * 10 + recencyScore(memory.updatedAt) * 5;
}

function meetsMinImportance(
  memory: Memory,
  minImportance?: MemoryImportance,
): boolean {
  if (!minImportance) return true;
  return importanceWeight(memory.importance) >= importanceWeight(minImportance);
}

/**
 * Ranks memories by importance and recency. AI-based re-ranking will be added later.
 */
export function rankMemories(
  memories: Memory[],
  options: MemoryRankOptions = {},
): Memory[] {
  const limit = options.limit ?? DEFAULT_RANK_LIMIT;

  return memories
    .filter((memory) => {
      if (options.memoryTypes?.length && !options.memoryTypes.includes(memory.memoryType)) {
        return false;
      }
      return meetsMinImportance(memory, options.minImportance);
    })
    .sort((a, b) => computeRankScore(b) - computeRankScore(a))
    .slice(0, limit);
}
