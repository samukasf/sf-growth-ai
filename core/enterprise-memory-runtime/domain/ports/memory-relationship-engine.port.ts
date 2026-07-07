import type { EnterpriseMemory, MemoryRelationship, MemoryRelationshipType } from "../entities";

export type LinkMemoryInput = {
  sourceMemoryId: string;
  targetMemoryId: string;
  relationshipType: MemoryRelationshipType;
  strength?: number;
};

export interface MemoryRelationshipEngine {
  link(input: LinkMemoryInput): Promise<MemoryRelationship>;
  findRelated(memoryId: string): Promise<EnterpriseMemory[]>;
  resolveGraph(memoryId: string, depth?: number): Promise<EnterpriseMemory[]>;
}
