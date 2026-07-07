import type { EnterpriseMemory, MemoryIndexEntry } from "../entities";

export interface MemoryIndexer {
  index(memory: EnterpriseMemory): Promise<MemoryIndexEntry>;
  reindex(memory: EnterpriseMemory): Promise<MemoryIndexEntry>;
  removeFromIndex(memoryId: string): Promise<void>;
  prepareSemanticVector(memoryId: string): Promise<boolean>;
}
