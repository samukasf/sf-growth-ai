import { CONTEXT_PRIORITY_WEIGHT } from "./context.constants";
import type { ContextFragment, ContextPriority } from "./context.types";

function priorityWeight(priority: ContextPriority): number {
  return CONTEXT_PRIORITY_WEIGHT[priority];
}

function recencyBoost(timestamp: string): number {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - ageDays / 180);
}

function computeFragmentScore(fragment: ContextFragment): number {
  return priorityWeight(fragment.priority) * 10 + recencyBoost(fragment.timestamp) * 5;
}

/**
 * Orders context fragments by priority and recency. AI re-ranking will be added later.
 */
export function prioritizeFragments(fragments: ContextFragment[]): ContextFragment[] {
  return [...fragments].sort(
    (a, b) => computeFragmentScore(b) - computeFragmentScore(a),
  );
}
