import type { EventDispatcher } from "../shared";
import type {
  KnowledgeClassifier,
  KnowledgeIndexer,
  KnowledgeQualityEvaluator,
  KnowledgeRepository,
  KnowledgeRetriever,
  KnowledgeRelationshipResolver,
} from "../domain";
import type {
  AIProviderPort,
  CompanyBrainPort,
  ExecutiveLearningPort,
  ExecutiveMemoryPort,
  ExecutiveWisdomPort,
} from "./ports/integration";

export type ExecutiveKnowledgeEngineDependencies = {
  repository: KnowledgeRepository;
  indexer: KnowledgeIndexer;
  classifier: KnowledgeClassifier;
  retriever: KnowledgeRetriever;
  relationshipResolver: KnowledgeRelationshipResolver;
  qualityEvaluator: KnowledgeQualityEvaluator;
  eventDispatcher: EventDispatcher;
  executiveMemory: ExecutiveMemoryPort;
  executiveLearning: ExecutiveLearningPort;
  executiveWisdom: ExecutiveWisdomPort;
  companyBrain: CompanyBrainPort;
  aiProvider: AIProviderPort;
};
