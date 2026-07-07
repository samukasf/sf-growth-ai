import type { MemoryType, MemoryVisibility } from "../../shared";

export type WriteMemoryDto = {
  organizationId: string;
  companyId: string;
  type: MemoryType;
  title: string;
  summary: string;
  content: string;
  sourceType: string;
  sourceOrigin: string;
  sourceReferenceId?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  visibility?: MemoryVisibility;
  owner: string;
};

export type UpdateMemoryDto = {
  memoryId: string;
  title?: string;
  summary?: string;
  content?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  visibility?: MemoryVisibility;
  owner?: string;
  changeReason?: string;
  updatedBy: string;
};

export type SearchMemoryDto = {
  organizationId: string;
  companyId: string;
  query?: string;
  type?: MemoryType;
  tags?: string[];
  owner?: string;
  includeArchived?: boolean;
  minRelevance?: number;
  limit?: number;
};

export type QueryMemoryDto = {
  organizationId: string;
  companyId: string;
  type?: MemoryType;
  tags?: string[];
  owner?: string;
  includeArchived?: boolean;
  limit?: number;
};

export type LinkMemoryRelationshipDto = {
  organizationId: string;
  companyId: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  relationshipType: import("../../domain").MemoryRelationshipType;
  strength?: number;
};

export type ArchiveMemoryDto = {
  memoryId: string;
};
