import { buildContext } from "./context.builder";
import { prioritizeFragments } from "./context.priority";
import { resolveContextSources } from "./context.resolver";
import { summarizeContext } from "./context.summary";
import { buildContextTimeline } from "./context.timeline";
import type {
  Context,
  ContextFragment,
  ContextInput,
  ContextOutput,
  ContextResolveResult,
  ContextSourceProvider,
  ContextSummaryResult,
  ContextTimelineEntry,
} from "./context.types";

export class ContextService {
  constructor(private readonly providers: ContextSourceProvider[]) {}

  resolve(input: ContextInput): ContextResolveResult {
    return resolveContextSources(input, this.providers);
  }

  build(input: ContextInput): Promise<Context> {
    const resolved = this.resolve(input);
    return buildContext(resolved, this.providers);
  }

  merge(contexts: Context[]): Context {
    if (contexts.length === 0) {
      throw new Error("At least one context is required to merge.");
    }

    const [first] = contexts;
    const fragmentMap = new Map<string, ContextFragment>();

    for (const context of contexts) {
      for (const fragment of context.fragments) {
        fragmentMap.set(fragment.id, fragment);
      }
    }

    return {
      id: `ctx-merged-${Date.now()}`,
      tenantId: first.tenantId,
      companyId: first.companyId,
      query: first.query,
      fragments: [...fragmentMap.values()],
      builtAt: new Date().toISOString(),
    };
  }

  prioritize(fragments: ContextFragment[]): ContextFragment[] {
    return prioritizeFragments(fragments);
  }

  summarize(context: Context): ContextSummaryResult {
    return summarizeContext(context);
  }

  timeline(fragments: ContextFragment[]): ContextTimelineEntry[] {
    return buildContextTimeline(fragments);
  }

  async buildOutput(input: ContextInput): Promise<ContextOutput> {
    const context = await this.build(input);
    const prioritizedFragments = this.prioritize(context.fragments);

    return {
      context,
      summary: this.summarize(context),
      prioritizedFragments,
      timeline: this.timeline(context.fragments),
      generatedAt: new Date().toISOString(),
    };
  }
}
