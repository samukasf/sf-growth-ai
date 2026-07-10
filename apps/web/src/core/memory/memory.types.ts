export type MemoryType =
  | "NOTE"
  | "CONVERSATION"
  | "DOCUMENT"
  | "CUSTOMER"
  | "PROJECT"
  | "TASK"
  | "MEETING"
  | "DISCOVERY"
  | "ASSESSMENT"
  | "MARKETING"
  | "FINANCIAL"
  | "STRATEGY";

export type MemoryImportance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Memory {
  id: string;
  tenantId: string;
  companyId: string;
  title: string;
  content: string;
  memoryType: MemoryType;
  importance: MemoryImportance;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryInput {
  tenantId: string;
  companyId: string;
  title: string;
  content: string;
  memoryType: MemoryType;
  importance: MemoryImportance;
  tags?: string[];
  createdBy: string;
}

export interface MemoryUpdateInput {
  title?: string;
  content?: string;
  memoryType?: MemoryType;
  importance?: MemoryImportance;
  tags?: string[];
}

export interface MemorySearch {
  tenantId: string;
  companyId: string;
  query?: string;
  memoryTypes?: MemoryType[];
  tags?: string[];
  importance?: MemoryImportance;
  limit?: number;
  offset?: number;
}

export interface MemorySearchResult {
  memory: Memory;
  score: number;
}

export interface MemorySummary {
  companyId: string;
  tenantId: string;
  totalMemories: number;
  byType: Partial<Record<MemoryType, number>>;
  byImportance: Partial<Record<MemoryImportance, number>>;
  topTags: string[];
  generatedAt: string;
}

export interface MemoryRankOptions {
  limit?: number;
  memoryTypes?: MemoryType[];
  minImportance?: MemoryImportance;
}
