import type { ExecutiveKnowledgeEngineDependencies } from "../../application";
import { ExecutiveKnowledgeEngine } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import { NoopAIProviderAdapter } from "../integration/noop-ai-provider.adapter";
import { NoopCompanyBrainAdapter } from "../integration/noop-company-brain.adapter";
import { NoopExecutiveLearningAdapter } from "../integration/noop-executive-learning.adapter";
import { NoopExecutiveMemoryAdapter } from "../integration/noop-executive-memory.adapter";
import { NoopExecutiveWisdomAdapter } from "../integration/noop-executive-wisdom.adapter";
import { InMemoryKnowledgeRepository } from "../persistence/in-memory-knowledge.repository";
import { DefaultKnowledgeClassifier } from "../services/default-knowledge-classifier";
import { DefaultKnowledgeIndexer } from "../services/default-knowledge-indexer";
import { DefaultKnowledgeQualityEvaluator } from "../services/default-knowledge-quality-evaluator";
import { DefaultKnowledgeRelationshipResolver } from "../services/default-knowledge-relationship-resolver";
import { DefaultKnowledgeRetriever } from "../services/default-knowledge-retriever";

export type CreateExecutiveKnowledgeEngineOptions = {
  dependencies?: Partial<ExecutiveKnowledgeEngineDependencies>;
};

export function createExecutiveKnowledgeEngine(
  options: CreateExecutiveKnowledgeEngineOptions = {},
): ExecutiveKnowledgeEngine {
  const eventDispatcher = options.dependencies?.eventDispatcher ?? new InMemoryEventBus();
  const executiveLearning =
    options.dependencies?.executiveLearning ?? new NoopExecutiveLearningAdapter();

  const dependencies: ExecutiveKnowledgeEngineDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryKnowledgeRepository(),
    indexer: options.dependencies?.indexer ?? new DefaultKnowledgeIndexer(),
    classifier: options.dependencies?.classifier ?? new DefaultKnowledgeClassifier(),
    retriever: options.dependencies?.retriever ?? new DefaultKnowledgeRetriever(),
    relationshipResolver:
      options.dependencies?.relationshipResolver ??
      new DefaultKnowledgeRelationshipResolver(),
    qualityEvaluator:
      options.dependencies?.qualityEvaluator ?? new DefaultKnowledgeQualityEvaluator(),
    eventDispatcher,
    executiveMemory:
      options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveLearning,
    executiveWisdom:
      options.dependencies?.executiveWisdom ?? new NoopExecutiveWisdomAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    aiProvider: options.dependencies?.aiProvider ?? new NoopAIProviderAdapter(),
  };

  return new ExecutiveKnowledgeEngine(dependencies);
}
