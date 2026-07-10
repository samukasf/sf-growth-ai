import { DEFAULT_SUMMARY_TOP_TAGS } from "./memory.constants";
import type { Memory, MemorySummary } from "./memory.types";

function countByField<T extends string>(
  memories: Memory[],
  selector: (memory: Memory) => T,
): Partial<Record<T, number>> {
  return memories.reduce<Partial<Record<T, number>>>((acc, memory) => {
    const key = selector(memory);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function extractTopTags(memories: Memory[], limit: number): string[] {
  const tagCounts = new Map<string, number>();

  for (const memory of memories) {
    for (const tag of memory.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Builds a structural summary of company memories. LLM summarization will be added later.
 */
export function summarizeMemories(
  memories: Memory[],
  tenantId: string,
  companyId: string,
): MemorySummary {
  return {
    companyId,
    tenantId,
    totalMemories: memories.length,
    byType: countByField(memories, (memory) => memory.memoryType),
    byImportance: countByField(memories, (memory) => memory.importance),
    topTags: extractTopTags(memories, DEFAULT_SUMMARY_TOP_TAGS),
    generatedAt: new Date().toISOString(),
  };
}
