import type {
  CreateExecutiveMemoryInput,
  ExecutiveMemoryKind,
  ExecutiveMemoryRecord,
  MemoryRetrievalInput,
  MemoryRetrievalMatch,
  MemoryRetrievalResult,
} from "../executive-memory-engine.types";
import {
  isRetrievableStatus,
  promoteMemoryLifecycle,
} from "./executive-memory-lifecycle.service";
import {
  buildInitialMemoryScores,
  computeFreshnessScore,
  rankMemoryMatchScore,
  refreshMemoryScores,
} from "./executive-memory-score.service";
import {
  loadExecutiveMemoryRecords,
  mirrorExecutiveMemoryToCompanyMemory,
  saveExecutiveMemoryRecordsLocal,
} from "./executive-memory-storage.service";

const DEFAULT_USER_ID = "executive-user";

function createMemoryId() {
  return `exec-memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function computeSimilarityScore(query: string, record: ExecutiveMemoryRecord): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const haystack = normalizeText(
    [record.title, record.content, record.context, record.category, ...record.tags].join(" "),
  );

  let matches = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) matches += 1;
  }

  return Math.round((matches / queryTokens.length) * 100);
}

function mapKnowledgeCategoryToMemoryKind(category: string): ExecutiveMemoryKind {
  switch (category) {
    case "question":
    case "answer":
      return "conversation";
    case "decision":
      return "decision";
    case "learning":
    case "feedback":
      return "learning";
    case "recommendation":
      return "knowledge_reference";
    case "executed_action":
    case "result":
      return "business";
    default:
      return "long";
  }
}

export function createExecutiveMemoryRecord(
  input: CreateExecutiveMemoryInput,
): ExecutiveMemoryRecord {
  const importanceLevel = input.importanceLevel ?? 50;
  const confidenceLevel = input.confidenceLevel ?? 50;
  const now = new Date().toISOString();

  return {
    id: createMemoryId(),
    companyId: input.companyId,
    userId: input.userId ?? DEFAULT_USER_ID,
    timestamp: now,
    category: input.category,
    context: input.context ?? "",
    content: input.content,
    origin: input.origin,
    responsibleEngine: input.responsibleEngine,
    importanceLevel,
    confidenceLevel,
    tags: input.tags ?? [],
    lastAccessedAt: now,
    reuseCount: 0,
    status: "new",
    memoryKind: input.memoryKind,
    title: input.title,
    scores: buildInitialMemoryScores(importanceLevel, confidenceLevel),
    knowledgeReferenceId: input.knowledgeReferenceId,
  };
}

export function listExecutiveMemoryRecords(companyId: string): ExecutiveMemoryRecord[] {
  return loadExecutiveMemoryRecords(companyId);
}

export async function saveExecutiveMemoryRecord(
  record: ExecutiveMemoryRecord,
): Promise<ExecutiveMemoryRecord[]> {
  const records = loadExecutiveMemoryRecords(record.companyId);
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)];
  saveExecutiveMemoryRecordsLocal(record.companyId, nextRecords);
  await mirrorExecutiveMemoryToCompanyMemory(record);
  return nextRecords;
}

export async function registerExecutiveMemory(
  input: CreateExecutiveMemoryInput,
): Promise<ExecutiveMemoryRecord> {
  const record = createExecutiveMemoryRecord(input);
  await saveExecutiveMemoryRecord(record);
  return record;
}

export function retrieveExecutiveMemory(
  input: MemoryRetrievalInput,
): MemoryRetrievalResult {
  const records = loadExecutiveMemoryRecords(input.companyId);
  const allowedStatuses = input.status ? new Set(input.status) : null;
  const tagFilter = input.tags ? new Set(input.tags.map(normalizeText)) : null;
  const query = [input.query, input.context].filter(Boolean).join(" ").trim();
  const limit = input.limit ?? 12;

  const candidates = records.filter((record) => {
    if (!isRetrievableStatus(record.status)) return false;
    if (input.userId && record.userId !== input.userId) return false;
    if (input.category && record.category !== input.category) return false;
    if (input.memoryKind && record.memoryKind !== input.memoryKind) return false;
    if (allowedStatuses && !allowedStatuses.has(record.status)) return false;
    if ((input.minImportance ?? 0) > record.importanceLevel) return false;
    if ((input.minConfidence ?? 0) > record.confidenceLevel) return false;
    if (tagFilter) {
      const recordTags = new Set(record.tags.map(normalizeText));
      const hasTag = [...tagFilter].some((tag) => recordTags.has(tag));
      if (!hasTag) return false;
    }
    return true;
  });

  const matches: MemoryRetrievalMatch[] = candidates
    .map((record) => {
      const similarityScore = query ? computeSimilarityScore(query, record) : 50;
      const recencyScore = computeFreshnessScore(record.lastAccessedAt, record.timestamp);
      const priorityScore = record.scores.importanceScore;
      const relevanceScore = rankMemoryMatchScore({
        similarityScore,
        recencyScore,
        priorityScore,
        reuseScore: record.scores.reuseScore,
        preferRecency: input.preferRecency,
        preferPriority: input.preferPriority,
      });

      return {
        record,
        relevanceScore,
        similarityScore,
        recencyScore,
        priorityScore,
      };
    })
    .filter((match) => (query ? match.similarityScore > 0 : true))
    .sort((left, right) => right.relevanceScore - left.relevanceScore)
    .slice(0, limit);

  return {
    query: input.query,
    matches,
    totalCandidates: candidates.length,
  };
}

export async function markExecutiveMemoryAccessed(
  companyId: string,
  memoryId: string,
): Promise<ExecutiveMemoryRecord | null> {
  const records = loadExecutiveMemoryRecords(companyId);
  const index = records.findIndex((record) => record.id === memoryId);
  if (index < 0) return null;

  const current = records[index];
  const reuseCount = current.reuseCount + 1;
  const lastAccessedAt = new Date().toISOString();
  const status = promoteMemoryLifecycle(current.status, reuseCount);

  const updated: ExecutiveMemoryRecord = {
    ...current,
    reuseCount,
    lastAccessedAt,
    status,
    scores: refreshMemoryScores(
      current.scores,
      current.importanceLevel,
      current.confidenceLevel,
      lastAccessedAt,
      current.timestamp,
      reuseCount,
    ),
  };

  records[index] = updated;
  saveExecutiveMemoryRecordsLocal(companyId, records);
  await mirrorExecutiveMemoryToCompanyMemory(updated);
  return updated;
}

export { mapKnowledgeCategoryToMemoryKind };
