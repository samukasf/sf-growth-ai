import { addMemory } from "@/services/executive-memory.service";

import type {
  ExecutiveKnowledgeRecord,
  ExecutiveKnowledgeState,
} from "../executive-knowledge.types";

const STORAGE_PREFIX = "sf-executive-knowledge";
const MEMORY_CATEGORY = "executive-knowledge";
const MEMORY_SOURCE = "executive-knowledge-platform";

function storageKey(companyId: string) {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadExecutiveKnowledge(companyId: string): ExecutiveKnowledgeRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as ExecutiveKnowledgeState;
    return parsed.records ?? [];
  } catch {
    return [];
  }
}

export function saveExecutiveKnowledgeLocal(
  companyId: string,
  records: ExecutiveKnowledgeRecord[],
): ExecutiveKnowledgeState {
  const state: ExecutiveKnowledgeState = {
    companyId,
    records,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(storageKey(companyId), JSON.stringify(state));
  }

  return state;
}

export async function persistExecutiveKnowledgeToMemory(
  record: ExecutiveKnowledgeRecord,
) {
  try {
    await addMemory({
      company_id: record.companyId,
      category: MEMORY_CATEGORY,
      title: record.title,
      content: JSON.stringify({
        id: record.id,
        category: record.category,
        origin: record.origin,
        context: record.context,
        content: record.content,
        involvedModules: record.involvedModules,
        responsibleEngine: record.responsibleEngine,
        confidenceScore: record.confidenceScore,
        tags: record.tags,
        scores: record.scores,
      }),
      importance: record.scores.knowledgeScore,
      source: MEMORY_SOURCE,
    });
  } catch {
    // Knowledge platform works offline-first; Supabase is optional.
  }
}
