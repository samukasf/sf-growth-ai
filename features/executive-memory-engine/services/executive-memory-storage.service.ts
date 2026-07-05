import { addMemory } from "@/services/executive-memory.service";

import type {
  ExecutiveMemoryRecord,
  ExecutiveMemoryState,
} from "../executive-memory-engine.types";

const STORAGE_PREFIX = "sf-executive-memory-engine";
const MEMORY_CATEGORY = "executive-memory-engine";
const MEMORY_SOURCE = "executive-memory-engine";

function storageKey(companyId: string) {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadExecutiveMemoryRecords(companyId: string): ExecutiveMemoryRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as ExecutiveMemoryState;
    return parsed.records ?? [];
  } catch {
    return [];
  }
}

export function saveExecutiveMemoryRecordsLocal(
  companyId: string,
  records: ExecutiveMemoryRecord[],
): ExecutiveMemoryState {
  const state: ExecutiveMemoryState = {
    companyId,
    records,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(storageKey(companyId), JSON.stringify(state));
  }

  return state;
}

export async function mirrorExecutiveMemoryToCompanyMemory(record: ExecutiveMemoryRecord) {
  try {
    await addMemory({
      company_id: record.companyId,
      category: MEMORY_CATEGORY,
      title: record.title,
      content: JSON.stringify({
        id: record.id,
        memoryKind: record.memoryKind,
        category: record.category,
        context: record.context,
        content: record.content,
        origin: record.origin,
        responsibleEngine: record.responsibleEngine,
        importanceLevel: record.importanceLevel,
        confidenceLevel: record.confidenceLevel,
        tags: record.tags,
        status: record.status,
        scores: record.scores,
        knowledgeReferenceId: record.knowledgeReferenceId,
      }),
      importance: record.scores.memoryScore,
      source: MEMORY_SOURCE,
    });
  } catch {
    // Memory engine is offline-first; Supabase mirror is optional.
  }
}
