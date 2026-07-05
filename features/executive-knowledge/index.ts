export type {
  CreateKnowledgeRecordInput,
  ExecutiveKnowledgeRecord,
  ExecutiveKnowledgeState,
  ExecutivePlaybook,
  ExecutivePlaybookEntry,
  KnowledgeCategory,
  KnowledgeEvaluation,
  KnowledgeOrigin,
  KnowledgeRetrievalInput,
  KnowledgeRetrievalResult,
  KnowledgeScores,
  LearningEvent,
  LearningEventType,
  LearningEventsState,
  PlaybookEntryType,
} from "./executive-knowledge.types";

export {
  createExecutiveKnowledgeRecord,
  evaluateExecutiveKnowledge,
  listExecutiveKnowledge,
  markKnowledgeReused,
  registerExecutiveKnowledge,
  retrieveExecutiveKnowledge,
  saveExecutiveKnowledgeRecord,
  searchExecutiveKnowledge,
} from "./services/executive-knowledge.service";

export {
  loadExecutiveKnowledge,
  persistExecutiveKnowledgeToMemory,
  saveExecutiveKnowledgeLocal,
} from "./services/executive-knowledge-persistence.service";

export {
  aggregateKnowledgeConfidence,
  applyKnowledgeEvaluation,
  applyKnowledgeReuse,
  buildInitialKnowledgeScores,
} from "./services/executive-knowledge-score.service";

export {
  canAnswerFromInternalKnowledge,
  resolveKnowledgeQuery,
  searchKnowledgeBase,
  type KnowledgeRetrievalFlowResult,
} from "./services/executive-knowledge-retrieval.service";

export {
  loadLearningEvents,
  mapInboxActionToLearningEventType,
  mapInboxCategoryToLearningEventType,
  registerLearningEvent,
  type RegisterLearningEventInput,
} from "./services/executive-learning-events.service";

export {
  addPlaybookEntry,
  buildExecutivePlaybookSummary,
  createPlaybookEntry,
  loadExecutivePlaybook,
  type CreatePlaybookEntryInput,
} from "./services/executive-playbook.service";

export {
  captureKnowledgeFromConversation,
  captureKnowledgeFromInboxAction,
} from "./services/executive-knowledge.integration";

export {
  AIProviderUnavailableError,
  createAIProviderRegistry,
  defaultAIProviderRegistry,
  FUTURE_PROVIDER_IDS,
  noopAIProvider,
  NOOP_AI_PROVIDER_ID,
  type AIProvider,
  type AIProviderCapability,
  type AIProviderInfo,
  type AIProviderMessage,
  type AIProviderRegistry,
  type AIProviderRequest,
  type AIProviderResponse,
  type AIProviderRole,
  type FutureProviderId,
} from "./providers";
