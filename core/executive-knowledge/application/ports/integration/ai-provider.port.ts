import type { KnowledgeRetrievalResult } from "../../../domain";

export type AIProviderKnowledgeRequest = {
  companyId: string;
  query: string;
  contextRecords: KnowledgeRetrievalResult;
};

export type AIProviderKnowledgeResponse = {
  available: boolean;
  reason: string;
};

export interface AIProviderPort {
  canHandle(request: AIProviderKnowledgeRequest): Promise<AIProviderKnowledgeResponse>;
}
