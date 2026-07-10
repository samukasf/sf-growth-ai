import { DEFAULT_SEARCH_LIMIT } from "./memory.constants";
import type { Memory, MemorySearch, MemorySearchResult } from "./memory.types";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2);
}

function computeTextScore(query: string, memory: Memory): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const haystack = normalizeText(
    [memory.title, memory.content, ...memory.tags].join(" "),
  );

  let matches = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) matches += 1;
  }

  return matches / queryTokens.length;
}

function matchesFilters(memory: Memory, criteria: MemorySearch): boolean {
  if (criteria.memoryTypes?.length && !criteria.memoryTypes.includes(memory.memoryType)) {
    return false;
  }

  if (criteria.importance && memory.importance !== criteria.importance) {
    return false;
  }

  if (criteria.tags?.length && !criteria.tags.every((tag) => memory.tags.includes(tag))) {
    return false;
  }

  return true;
}

/**
 * Keyword-based search scaffold. Embedding and vector search will be added later.
 */
export function searchMemories(
  memories: Memory[],
  criteria: MemorySearch,
): MemorySearchResult[] {
  const limit = criteria.limit ?? DEFAULT_SEARCH_LIMIT;
  const offset = criteria.offset ?? 0;

  const filtered = memories.filter((memory) => matchesFilters(memory, criteria));

  const scored = filtered.map((memory) => ({
    memory,
    score: criteria.query ? computeTextScore(criteria.query, memory) : 1,
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.memory.updatedAt).getTime() - new Date(a.memory.updatedAt).getTime();
  });

  return scored.slice(offset, offset + limit);
}
