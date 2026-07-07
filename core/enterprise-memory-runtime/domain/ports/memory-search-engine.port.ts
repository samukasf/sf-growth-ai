import type { EnterpriseMemory } from "../entities";
import type { SearchQuery } from "./memory-repository.port";

export type SearchResult = {
  memory: EnterpriseMemory;
  relevanceScore: number;
  matchReason: string;
};

export interface MemorySearchEngine {
  search(query: SearchQuery): Promise<SearchResult[]>;
  searchByKeyword(keyword: string, organizationId: string, companyId: string): Promise<SearchResult[]>;
  searchSemanticPlaceholder(query: string, organizationId: string, companyId: string): Promise<SearchResult[]>;
}
