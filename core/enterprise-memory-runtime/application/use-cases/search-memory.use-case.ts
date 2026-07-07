import type { SearchMemoryDto } from "../dto";
import type { EnterpriseMemoryRuntimeDependencies } from "../dependencies";

export class SearchMemoryUseCase {
  constructor(private readonly deps: EnterpriseMemoryRuntimeDependencies) {}

  async execute(dto: SearchMemoryDto) {
    if (this.deps.aiProvider.isAvailable() && dto.query) {
      return this.deps.searchEngine.searchSemanticPlaceholder(
        dto.query,
        dto.organizationId,
        dto.companyId,
      );
    }

    return this.deps.searchEngine.search({
      organizationId: dto.organizationId,
      companyId: dto.companyId,
      query: dto.query,
      type: dto.type,
      tags: dto.tags,
      owner: dto.owner,
      includeArchived: dto.includeArchived,
      minRelevance: dto.minRelevance,
      limit: dto.limit,
    });
  }
}
