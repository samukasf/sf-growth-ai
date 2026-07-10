import type { MemoryRepository } from "./memory.repository";
import { rankMemories } from "./memory.ranking";
import { searchMemories } from "./memory.search";
import { summarizeMemories } from "./memory.summary";
import type {
  Memory,
  MemoryInput,
  MemoryRankOptions,
  MemorySearch,
  MemorySearchResult,
  MemorySummary,
  MemoryUpdateInput,
} from "./memory.types";

export class MemoryService {
  constructor(private readonly repository: MemoryRepository) {}

  create(input: MemoryInput): Promise<Memory> {
    return this.repository.create(input);
  }

  update(id: string, input: MemoryUpdateInput): Promise<Memory | null> {
    return this.repository.update(id, input);
  }

  delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  findById(id: string): Promise<Memory | null> {
    return this.repository.findById(id);
  }

  async search(criteria: MemorySearch): Promise<MemorySearchResult[]> {
    const memories = await this.repository.search(criteria);
    return searchMemories(memories, criteria);
  }

  listByCompany(tenantId: string, companyId: string): Promise<Memory[]> {
    return this.repository.findByCompany(tenantId, companyId);
  }

  async summarize(tenantId: string, companyId: string): Promise<MemorySummary> {
    const memories = await this.repository.findByCompany(tenantId, companyId);
    return summarizeMemories(memories, tenantId, companyId);
  }

  async rank(
    tenantId: string,
    companyId: string,
    options?: MemoryRankOptions,
  ): Promise<Memory[]> {
    const memories = await this.repository.findByCompany(tenantId, companyId);
    return rankMemories(memories, options);
  }
}
