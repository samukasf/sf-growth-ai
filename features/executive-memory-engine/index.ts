export type {
  BusinessMemoryEntityType,
  CreateBusinessMemoryEntryInput,
  CreateExecutiveMemoryInput,
  ExecutiveBusinessMemory,
  ExecutiveBusinessMemoryEntry,
  ExecutiveBusinessMemoryStore,
  ExecutiveConversationMemory,
  ExecutiveDecisionMemory,
  ExecutiveKnowledgeReference,
  ExecutiveLearningMemory,
  ExecutiveLongMemory,
  ExecutiveMemoryKind,
  ExecutiveMemoryRecord,
  ExecutiveMemoryState,
  ExecutiveRelationshipMemory,
  ExecutiveShortMemory,
  MemoryLifecycleStatus,
  MemoryRetrievalInput,
  MemoryRetrievalMatch,
  MemoryRetrievalResult,
  MemoryScores,
} from "./executive-memory-engine.types";

export {
  archiveMemoryLifecycle,
  compareLifecyclePriority,
  isRetrievableStatus,
  markMemoryObsolete,
  MEMORY_LIFECYCLE_LABELS,
  promoteMemoryLifecycle,
} from "./services/executive-memory-lifecycle.service";

export {
  applyMemoryReuse,
  buildInitialMemoryScores,
  computeFreshnessScore,
  rankMemoryMatchScore,
  refreshMemoryScores,
} from "./services/executive-memory-score.service";

export {
  loadExecutiveMemoryRecords,
  mirrorExecutiveMemoryToCompanyMemory,
  saveExecutiveMemoryRecordsLocal,
} from "./services/executive-memory-storage.service";

export {
  addBusinessMemoryEntry,
  buildBusinessMemorySummary,
  createBusinessMemoryEntry,
  loadExecutiveBusinessMemory,
} from "./services/executive-memory-business.service";

export {
  createExecutiveMemoryRecord,
  listExecutiveMemoryRecords,
  mapKnowledgeCategoryToMemoryKind,
  markExecutiveMemoryAccessed,
  registerExecutiveMemory,
  retrieveExecutiveMemory,
  saveExecutiveMemoryRecord,
} from "./services/executive-memory-engine.service";

export {
  syncConversationToExecutiveMemory,
  syncExecutiveKnowledgeToMemory,
  syncInboxActionToExecutiveMemory,
  syncLearningEventToMemory,
} from "./services/executive-memory-integration.service";

/**
 * Future consumers: Executive Wisdom, Executive RAG, Executive AI Providers.
 * This registry documents the memory engine entry points without coupling providers yet.
 */
export const EXECUTIVE_MEMORY_FUTURE_CONSUMERS = [
  "executive-wisdom",
  "executive-rag",
  "executive-ai-providers",
] as const;

export type ExecutiveMemoryFutureConsumer =
  (typeof EXECUTIVE_MEMORY_FUTURE_CONSUMERS)[number];
