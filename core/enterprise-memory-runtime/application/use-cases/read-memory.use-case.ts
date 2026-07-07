import type { QueryMemoryDto } from "../dto";
import type { EnterpriseMemoryRuntimeDependencies } from "../dependencies";

export class ReadMemoryUseCase {
  constructor(private readonly deps: EnterpriseMemoryRuntimeDependencies) {}

  async executeById(memoryId: string) {
    return this.deps.reader.readById(memoryId);
  }

  async executeQuery(dto: QueryMemoryDto) {
    return this.deps.reader.readByQuery({
      organizationId: dto.organizationId,
      companyId: dto.companyId,
      type: dto.type,
      tags: dto.tags,
      owner: dto.owner,
      includeArchived: dto.includeArchived,
      limit: dto.limit,
    });
  }

  async executeHistory(memoryId: string) {
    return this.deps.reader.readHistory(memoryId);
  }
}
