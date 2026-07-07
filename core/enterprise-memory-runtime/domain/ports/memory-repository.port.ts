import type { EnterpriseMemory, MemoryIndexEntry, MemoryRelationship, MemoryVersion } from "../entities";
import type { MemoryType, OrganizationId, CompanyId } from "../../shared";

export type MemoryQuery = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  type?: MemoryType;
  tags?: string[];
  owner?: string;
  query?: string;
  includeArchived?: boolean;
  limit?: number;
};

export type SearchQuery = MemoryQuery & {
  semanticReady?: boolean;
  minRelevance?: number;
};

export interface MemoryRepository {
  save(memory: EnterpriseMemory): Promise<void>;
  findById(id: string): Promise<EnterpriseMemory | null>;
  findByOrganization(organizationId: string, companyId: string): Promise<EnterpriseMemory[]>;
  query(filters: MemoryQuery): Promise<EnterpriseMemory[]>;
  saveVersion(version: MemoryVersion): Promise<void>;
  findVersionsByMemoryId(memoryId: string): Promise<MemoryVersion[]>;
  saveRelationship(relationship: MemoryRelationship): Promise<void>;
  findRelationshipsByMemoryId(memoryId: string): Promise<MemoryRelationship[]>;
  saveIndexEntry(entry: MemoryIndexEntry): Promise<void>;
  findIndexEntryByMemoryId(memoryId: string): Promise<MemoryIndexEntry | null>;
}
