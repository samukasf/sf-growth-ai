import type { EnterpriseMemory } from "../entities";

export type WriteMemoryInput = {
  organizationId: string;
  companyId: string;
  type: EnterpriseMemory["type"];
  title: string;
  summary: string;
  content: string;
  sourceType: string;
  sourceOrigin: string;
  sourceReferenceId?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  visibility?: EnterpriseMemory["visibility"];
  owner: string;
};

export interface MemoryWriter {
  write(input: WriteMemoryInput): Promise<EnterpriseMemory>;
}
