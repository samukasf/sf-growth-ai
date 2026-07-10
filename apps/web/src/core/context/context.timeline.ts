import type { ContextFragment, ContextTimelineEntry } from "./context.types";

function toTimelineEntry(fragment: ContextFragment): ContextTimelineEntry {
  return {
    timestamp: fragment.timestamp,
    source: fragment.source,
    title: fragment.title,
    content: fragment.content,
    priority: fragment.priority,
  };
}

/**
 * Builds a chronological view of context fragments, newest first.
 */
export function buildContextTimeline(fragments: ContextFragment[]): ContextTimelineEntry[] {
  return [...fragments]
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .map(toTimelineEntry);
}
