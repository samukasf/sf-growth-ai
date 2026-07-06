import type { KnowledgeRecord } from "../entities";

export type KnowledgeRetrievalQuery = {
  companyId: string;
  query: string;
  limit?: number;
  minRelevance?: number;
};

export type KnowledgeRetrievalMatch = {
  record: KnowledgeRecord;
  score: number;
  matchedTerms: string[];
};

export type KnowledgeRetrievalResult = {
  query: string;
  matches: KnowledgeRetrievalMatch[];
  sufficient: boolean;
  aggregateScore: number;
};

export interface KnowledgeRetriever {
  retrieve(
    records: KnowledgeRecord[],
    query: KnowledgeRetrievalQuery,
  ): KnowledgeRetrievalResult;
}
