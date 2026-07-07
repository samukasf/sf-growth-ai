import type { MemoryRepository, SearchQuery } from "../../domain/ports/memory-repository.port";
import type {
  MemorySearchEngine,
  SearchResult,
} from "../../domain/ports/memory-search-engine.port";
import { DefaultMemoryRetentionEngine } from "./default-memory-retention-engine";

export class DefaultMemorySearchEngine implements MemorySearchEngine {
  private readonly retentionEngine = new DefaultMemoryRetentionEngine();

  constructor(private readonly repository: MemoryRepository) {}

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const memories = await this.repository.query(query);

    const results: SearchResult[] = memories.map((memory) => {
      const relevance = this.retentionEngine.scoreRelevance(memory);
      let matchReason = relevance.factors.join(", ");

      if (query.query) {
        const term = query.query.toLowerCase();
        if (memory.title.toLowerCase().includes(term)) matchReason += ", title-match";
        if (memory.content.toLowerCase().includes(term)) matchReason += ", content-match";
      }

      return {
        memory,
        relevanceScore: relevance.value,
        matchReason,
      };
    });

    const minRelevance = query.minRelevance ?? 0;
    return results
      .filter((result) => result.relevanceScore >= minRelevance)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, query.limit ?? 50);
  }

  async searchByKeyword(
    keyword: string,
    organizationId: string,
    companyId: string,
  ): Promise<SearchResult[]> {
    return this.search({
      organizationId,
      companyId,
      query: keyword,
    });
  }

  async searchSemanticPlaceholder(
    query: string,
    organizationId: string,
    companyId: string,
  ): Promise<SearchResult[]> {
    const results = await this.search({
      organizationId,
      companyId,
      query,
      semanticReady: true,
    });

    return results.map((result) => ({
      ...result,
      matchReason: `semantic-placeholder: ${result.matchReason}`,
    }));
  }
}
