import type {
  CreateKnowledgeRecordInput,
  ExecutiveKnowledgeRecord,
  KnowledgeRetrievalInput,
  KnowledgeRetrievalResult,
} from "../executive-knowledge.types";
import {
  aggregateKnowledgeConfidence,
  applyKnowledgeEvaluation,
  applyKnowledgeReuse,
  buildInitialKnowledgeScores,
} from "./executive-knowledge-score.service";
import {
  loadExecutiveKnowledge,
  persistExecutiveKnowledgeToMemory,
  saveExecutiveKnowledgeLocal,
} from "./executive-knowledge-persistence.service";

const DEFAULT_USER_ID = "executive-user";
const SUFFICIENCY_THRESHOLD = 45;
const MIN_MATCHES_FOR_SUFFICIENCY = 1;

function createKnowledgeId() {
  return `knowledge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function computeMatchScore(query: string, record: ExecutiveKnowledgeRecord): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const haystack = normalizeText(
    [record.title, record.content, record.context, ...record.tags].join(" "),
  );

  let matches = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) matches += 1;
  }

  const tokenRatio = matches / queryTokens.length;
  const categoryBoost =
    record.category === "answer" || record.category === "recommendation" ? 0.15 : 0;
  const reuseBoost = Math.min(0.2, record.reuseCount * 0.03);

  return Math.min(1, tokenRatio + categoryBoost + reuseBoost);
}

export function createExecutiveKnowledgeRecord(
  input: CreateKnowledgeRecordInput,
): ExecutiveKnowledgeRecord {
  const confidenceScore = input.confidenceScore ?? 50;

  return {
    id: createKnowledgeId(),
    companyId: input.companyId,
    userId: input.userId ?? DEFAULT_USER_ID,
    timestamp: new Date().toISOString(),
    category: input.category,
    origin: input.origin,
    context: input.context ?? "",
    title: input.title,
    content: input.content,
    involvedModules: input.involvedModules ?? [],
    responsibleEngine: input.responsibleEngine,
    confidenceScore,
    reuseCount: 0,
    evaluation: input.evaluation ?? null,
    tags: input.tags ?? [],
    scores: buildInitialKnowledgeScores(confidenceScore, input.evaluation ?? null),
  };
}

export function listExecutiveKnowledge(companyId: string): ExecutiveKnowledgeRecord[] {
  return loadExecutiveKnowledge(companyId);
}

export async function saveExecutiveKnowledgeRecord(
  record: ExecutiveKnowledgeRecord,
): Promise<ExecutiveKnowledgeRecord[]> {
  const records = loadExecutiveKnowledge(record.companyId);
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)];
  saveExecutiveKnowledgeLocal(record.companyId, nextRecords);
  await persistExecutiveKnowledgeToMemory(record);
  return nextRecords;
}

export async function registerExecutiveKnowledge(
  input: CreateKnowledgeRecordInput,
): Promise<ExecutiveKnowledgeRecord> {
  const record = createExecutiveKnowledgeRecord(input);
  await saveExecutiveKnowledgeRecord(record);
  return record;
}

export function searchExecutiveKnowledge(
  input: KnowledgeRetrievalInput,
): ExecutiveKnowledgeRecord[] {
  const records = loadExecutiveKnowledge(input.companyId);
  const categories = input.categories ? new Set(input.categories) : null;
  const minConfidence = input.minConfidence ?? 0;
  const limit = input.limit ?? 8;

  return records
    .filter((record) => {
      if (categories && !categories.has(record.category)) return false;
      return record.confidenceScore >= minConfidence;
    })
    .map((record) => ({
      record,
      matchScore: computeMatchScore(input.query, record),
    }))
    .filter((item) => item.matchScore > 0)
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, limit)
    .map((item) => item.record);
}

function buildSuggestedAnswer(records: ExecutiveKnowledgeRecord[]): string | undefined {
  const answer = records.find((record) => record.category === "answer");
  if (answer) return answer.content;

  const recommendation = records.find((record) => record.category === "recommendation");
  if (recommendation) return recommendation.content;

  const analysis = records.find((record) => record.category === "analysis");
  if (analysis) return analysis.content;

  const learning = records.find((record) => record.category === "learning");
  if (learning) return learning.content;

  return records[0]?.content;
}

export function retrieveExecutiveKnowledge(
  input: KnowledgeRetrievalInput,
): KnowledgeRetrievalResult {
  const records = searchExecutiveKnowledge(input);
  const aggregateConfidence = aggregateKnowledgeConfidence(
    records.map((record) => record.scores),
  );
  const sufficient =
    records.length >= MIN_MATCHES_FOR_SUFFICIENCY &&
    aggregateConfidence >= SUFFICIENCY_THRESHOLD;
  const canAnswerFromKnowledge = sufficient && Boolean(buildSuggestedAnswer(records));

  return {
    query: input.query,
    records,
    matchedCount: records.length,
    sufficient,
    aggregateConfidence,
    canAnswerFromKnowledge,
    requiresAiProvider: !canAnswerFromKnowledge,
    suggestedAnswer: canAnswerFromKnowledge ? buildSuggestedAnswer(records) : undefined,
  };
}

export async function markKnowledgeReused(
  companyId: string,
  recordId: string,
): Promise<ExecutiveKnowledgeRecord | null> {
  const records = loadExecutiveKnowledge(companyId);
  const index = records.findIndex((record) => record.id === recordId);
  if (index < 0) return null;

  const current = records[index];
  const reuseCount = current.reuseCount + 1;
  const updated: ExecutiveKnowledgeRecord = {
    ...current,
    reuseCount,
    scores: applyKnowledgeReuse(current.scores, reuseCount),
  };

  records[index] = updated;
  saveExecutiveKnowledgeLocal(companyId, records);
  await persistExecutiveKnowledgeToMemory(updated);
  return updated;
}

export async function evaluateExecutiveKnowledge(
  companyId: string,
  recordId: string,
  evaluation: ExecutiveKnowledgeRecord["evaluation"],
): Promise<ExecutiveKnowledgeRecord | null> {
  const records = loadExecutiveKnowledge(companyId);
  const index = records.findIndex((record) => record.id === recordId);
  if (index < 0) return null;

  const current = records[index];
  const updated: ExecutiveKnowledgeRecord = {
    ...current,
    evaluation,
    scores: applyKnowledgeEvaluation(current.scores, evaluation),
  };

  records[index] = updated;
  saveExecutiveKnowledgeLocal(companyId, records);
  await persistExecutiveKnowledgeToMemory(updated);
  return updated;
}
