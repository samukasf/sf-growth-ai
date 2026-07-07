import type { EnterpriseMemory } from "../entities";
import type { LinkMemoryInput } from "./memory-relationship-engine.port";
import type { MemoryQuery, SearchQuery } from "./memory-repository.port";
import type { SearchResult } from "./memory-search-engine.port";
import type { UpdateMemoryInput } from "./memory-lifecycle-manager.port";
import type { WriteMemoryInput } from "./memory-writer.port";

export interface MemoryRuntime {
  write(input: WriteMemoryInput): Promise<EnterpriseMemory>;
  read(memoryId: string): Promise<EnterpriseMemory | null>;
  query(filters: MemoryQuery): Promise<EnterpriseMemory[]>;
  search(query: SearchQuery): Promise<SearchResult[]>;
  update(input: UpdateMemoryInput): Promise<EnterpriseMemory>;
  linkRelationship(input: LinkMemoryInput): Promise<EnterpriseMemory>;
  archive(memoryId: string): Promise<EnterpriseMemory>;
  getHistory(memoryId: string): Promise<import("../entities").MemoryVersion[]>;
}
