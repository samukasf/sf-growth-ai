import { DEFAULT_CONTEXT_LIMIT } from "./context.constants";
import { getProviderForSource } from "./context.resolver";
import type {
  Context,
  ContextFragment,
  ContextInput,
  ContextResolveResult,
  ContextSourceProvider,
} from "./context.types";

function createContextId(): string {
  return `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function filterBySince(fragments: ContextFragment[], since?: string): ContextFragment[] {
  if (!since) return fragments;

  const sinceTime = new Date(since).getTime();
  return fragments.filter((fragment) => new Date(fragment.timestamp).getTime() >= sinceTime);
}

function applyLimit(fragments: ContextFragment[], limit?: number): ContextFragment[] {
  return fragments.slice(0, limit ?? DEFAULT_CONTEXT_LIMIT);
}

async function fetchFromSource(
  provider: ContextSourceProvider,
  input: ContextInput,
): Promise<ContextFragment[]> {
  return provider.fetch(input);
}

/**
 * Assembles a Context from resolved sources. No LLM processing — raw data only.
 */
export async function buildContext(
  resolved: ContextResolveResult,
  providers: ContextSourceProvider[],
): Promise<Context> {
  const { input, sources } = resolved;
  const fragmentGroups = await Promise.all(
    sources.map(async (source) => {
      const provider = getProviderForSource(providers, source);
      if (!provider) return [];
      return fetchFromSource(provider, input);
    }),
  );

  const fragments = applyLimit(
    filterBySince(fragmentGroups.flat(), input.since),
    input.limit,
  );

  return {
    id: createContextId(),
    tenantId: input.tenantId,
    companyId: input.companyId,
    query: input.query,
    fragments,
    builtAt: new Date().toISOString(),
  };
}
