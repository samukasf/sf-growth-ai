import { DEFAULT_SUMMARY_TOP_TAGS } from "./context.constants";
import type {
  Context,
  ContextFragment,
  ContextSummaryResult,
} from "./context.types";

function countByField<T extends string>(
  fragments: ContextFragment[],
  selector: (fragment: ContextFragment) => T,
): Partial<Record<T, number>> {
  return fragments.reduce<Partial<Record<T, number>>>((acc, fragment) => {
    const key = selector(fragment);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function extractTopTags(fragments: ContextFragment[], limit: number): string[] {
  const tagCounts = new Map<string, number>();

  for (const fragment of fragments) {
    for (const tag of fragment.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Produces a structural summary of assembled context. LLM summarization will be added later.
 */
export function summarizeContext(context: Context): ContextSummaryResult {
  const { fragments, tenantId, companyId } = context;

  return {
    tenantId,
    companyId,
    totalFragments: fragments.length,
    bySource: countByField(fragments, (fragment) => fragment.source),
    byPriority: countByField(fragments, (fragment) => fragment.priority),
    topTags: extractTopTags(fragments, DEFAULT_SUMMARY_TOP_TAGS),
    generatedAt: new Date().toISOString(),
  };
}
