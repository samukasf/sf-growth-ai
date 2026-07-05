import type {
  BusinessMemoryEntityType,
  CreateBusinessMemoryEntryInput,
  ExecutiveBusinessMemoryEntry,
  ExecutiveBusinessMemoryStore,
} from "../executive-memory-engine.types";

const STORAGE_PREFIX = "sf-executive-business-memory";

function storageKey(companyId: string) {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function createBusinessEntryId() {
  return `business-memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyBusinessMemory(companyId: string): ExecutiveBusinessMemoryStore {
  return {
    companyId,
    clients: [],
    campaigns: [],
    projects: [],
    products: [],
    problems: [],
    solutions: [],
    meetings: [],
    decisions: [],
    strategies: [],
    results: [],
    updatedAt: new Date().toISOString(),
  };
}

function bucketForEntity(
  entityType: BusinessMemoryEntityType,
): keyof Omit<ExecutiveBusinessMemoryStore, "companyId" | "updatedAt"> {
  switch (entityType) {
    case "client":
      return "clients";
    case "campaign":
      return "campaigns";
    case "project":
      return "projects";
    case "product":
      return "products";
    case "problem":
      return "problems";
    case "solution":
      return "solutions";
    case "meeting":
      return "meetings";
    case "decision":
      return "decisions";
    case "strategy":
      return "strategies";
    case "result":
      return "results";
  }
}

export function loadExecutiveBusinessMemory(
  companyId: string,
): ExecutiveBusinessMemoryStore {
  if (!isBrowser()) return emptyBusinessMemory(companyId);

  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return emptyBusinessMemory(companyId);
    return JSON.parse(raw) as ExecutiveBusinessMemoryStore;
  } catch {
    return emptyBusinessMemory(companyId);
  }
}

function saveExecutiveBusinessMemory(store: ExecutiveBusinessMemoryStore) {
  const nextStore = {
    ...store,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(storageKey(store.companyId), JSON.stringify(nextStore));
  }

  return nextStore;
}

export function createBusinessMemoryEntry(
  input: CreateBusinessMemoryEntryInput,
): ExecutiveBusinessMemoryEntry {
  const now = new Date().toISOString();

  return {
    id: createBusinessEntryId(),
    companyId: input.companyId,
    entityType: input.entityType,
    title: input.title,
    description: input.description,
    context: input.context ?? "",
    tags: input.tags ?? [],
    memoryRecordId: input.memoryRecordId,
    createdAt: now,
    updatedAt: now,
  };
}

export function addBusinessMemoryEntry(
  input: CreateBusinessMemoryEntryInput,
): ExecutiveBusinessMemoryEntry {
  const store = loadExecutiveBusinessMemory(input.companyId);
  const entry = createBusinessMemoryEntry(input);
  const bucket = bucketForEntity(input.entityType);

  saveExecutiveBusinessMemory({
    ...store,
    [bucket]: [entry, ...store[bucket]],
  });

  return entry;
}

export function buildBusinessMemorySummary(companyId: string) {
  const store = loadExecutiveBusinessMemory(companyId);

  return {
    companyId,
    totals: {
      clients: store.clients.length,
      campaigns: store.campaigns.length,
      projects: store.projects.length,
      products: store.products.length,
      problems: store.problems.length,
      solutions: store.solutions.length,
      meetings: store.meetings.length,
      decisions: store.decisions.length,
      strategies: store.strategies.length,
      results: store.results.length,
    },
    updatedAt: store.updatedAt,
  };
}
