import type { EnterpriseMemory, MemoryVersion } from "../entities";
import type { MemoryQuery } from "./memory-repository.port";

export interface MemoryReader {
  readById(memoryId: string): Promise<EnterpriseMemory | null>;
  readByQuery(query: MemoryQuery): Promise<EnterpriseMemory[]>;
  readHistory(memoryId: string): Promise<MemoryVersion[]>;
}
