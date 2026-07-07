import type { EnterpriseMemory, MemoryVersion } from "../entities";

export type UpdateMemoryInput = {
  memoryId: string;
  title?: string;
  summary?: string;
  content?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  visibility?: EnterpriseMemory["visibility"];
  owner?: string;
  changeReason?: string;
  updatedBy: string;
};

export interface MemoryLifecycleManager {
  update(input: UpdateMemoryInput): Promise<{ memory: EnterpriseMemory; version: MemoryVersion }>;
  archive(memoryId: string): Promise<EnterpriseMemory>;
  restore(memoryId: string): Promise<EnterpriseMemory>;
  createVersion(
    memory: EnterpriseMemory,
    changeReason: string,
    updatedBy: string,
  ): Promise<MemoryVersion>;
}
