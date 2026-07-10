import { ALL_CONTEXT_SOURCES } from "./context.constants";
import type {
  ContextInput,
  ContextResolveResult,
  ContextSource,
  ContextSourceProvider,
} from "./context.types";

const QUERY_SOURCE_HINTS: Record<string, ContextSource[]> = {
  projeto: ["PROJECTS"],
  project: ["PROJECTS"],
  cliente: ["CLIENTS"],
  customer: ["CLIENTS"],
  agenda: ["AGENDA"],
  reuniao: ["AGENDA", "CONVERSATIONS"],
  meeting: ["AGENDA", "CONVERSATIONS"],
  financeiro: ["FINANCIAL"],
  financial: ["FINANCIAL"],
  marketing: ["MARKETING"],
  documento: ["DOCUMENTS"],
  document: ["DOCUMENTS"],
  conversa: ["CONVERSATIONS"],
  conversation: ["CONVERSATIONS"],
  conselho: ["EXECUTIVE_COUNCIL"],
  council: ["EXECUTIVE_COUNCIL"],
  estrategia: ["EXECUTIVE_COUNCIL", "MEMORY"],
  strategy: ["EXECUTIVE_COUNCIL", "MEMORY"],
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function inferSourcesFromQuery(query?: string): ContextSource[] {
  if (!query) return [];

  const normalized = normalizeText(query);
  const inferred = new Set<ContextSource>();

  for (const [hint, sources] of Object.entries(QUERY_SOURCE_HINTS)) {
    if (normalized.includes(hint)) {
      for (const source of sources) {
        inferred.add(source);
      }
    }
  }

  return [...inferred];
}

function mergeSources(
  explicit: ContextSource[] | undefined,
  inferred: ContextSource[],
): ContextSource[] {
  const merged = new Set<ContextSource>(explicit ?? ALL_CONTEXT_SOURCES);
  for (const source of inferred) {
    merged.add(source);
  }
  return [...merged];
}

function filterAvailableSources(
  sources: ContextSource[],
  providers: ContextSourceProvider[],
): ContextSource[] {
  const available = new Set(providers.map((provider) => provider.source));
  return sources.filter((source) => available.has(source));
}

/**
 * Determines which context sources should be loaded for a given input.
 */
export function resolveContextSources(
  input: ContextInput,
  providers: ContextSourceProvider[],
): ContextResolveResult {
  const inferred = inferSourcesFromQuery(input.query);
  const requested = mergeSources(input.sources, inferred);
  const sources = filterAvailableSources(requested, providers);

  return { sources, input };
}

export function getProviderForSource(
  providers: ContextSourceProvider[],
  source: ContextSource,
): ContextSourceProvider | undefined {
  return providers.find((provider) => provider.source === source);
}
