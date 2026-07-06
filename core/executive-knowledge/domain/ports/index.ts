export type { KnowledgeQuery, KnowledgeRepository } from "./knowledge-repository.port";
export type { KnowledgeIndexEntry, KnowledgeIndexer } from "./knowledge-indexer.port";
export type {
  ClassificationInput,
  ClassificationResult,
  KnowledgeClassifier,
} from "./knowledge-classifier.port";
export type {
  KnowledgeRetrievalMatch,
  KnowledgeRetrievalQuery,
  KnowledgeRetrievalResult,
  KnowledgeRetriever,
} from "./knowledge-retriever.port";
export type {
  KnowledgeRelationshipResolver,
  ResolveRelationsInput,
  ResolvedRelation,
} from "./knowledge-relationship-resolver.port";
export type {
  KnowledgeQualityEvaluator,
  KnowledgeQualityReport,
} from "./knowledge-quality-evaluator.port";
