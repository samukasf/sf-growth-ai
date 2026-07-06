export type RetrieveKnowledgeDto = {
  companyId: string;
  query: string;
  limit?: number;
  minRelevance?: number;
};
