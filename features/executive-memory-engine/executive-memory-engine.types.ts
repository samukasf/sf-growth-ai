export type MemoryLifecycleStatus =
  | "new"
  | "active"
  | "recurring"
  | "archived"
  | "obsolete";

export type ExecutiveMemoryKind =
  | "short"
  | "long"
  | "conversation"
  | "business"
  | "decision"
  | "learning"
  | "relationship"
  | "knowledge_reference";

export type MemoryScores = {
  memoryScore: number;
  confidenceScore: number;
  importanceScore: number;
  reuseScore: number;
  freshnessScore: number;
};

export type ExecutiveMemoryRecord = {
  id: string;
  companyId: string;
  userId: string;
  timestamp: string;
  category: string;
  context: string;
  content: string;
  origin: string;
  responsibleEngine: string;
  importanceLevel: number;
  confidenceLevel: number;
  tags: string[];
  lastAccessedAt: string;
  reuseCount: number;
  status: MemoryLifecycleStatus;
  memoryKind: ExecutiveMemoryKind;
  title: string;
  scores: MemoryScores;
  knowledgeReferenceId?: string;
};

export type ExecutiveShortMemory = ExecutiveMemoryRecord & { memoryKind: "short" };
export type ExecutiveLongMemory = ExecutiveMemoryRecord & { memoryKind: "long" };
export type ExecutiveConversationMemory = ExecutiveMemoryRecord & {
  memoryKind: "conversation";
};
export type ExecutiveBusinessMemory = ExecutiveMemoryRecord & { memoryKind: "business" };
export type ExecutiveDecisionMemory = ExecutiveMemoryRecord & { memoryKind: "decision" };
export type ExecutiveLearningMemory = ExecutiveMemoryRecord & { memoryKind: "learning" };
export type ExecutiveRelationshipMemory = ExecutiveMemoryRecord & {
  memoryKind: "relationship";
};
export type ExecutiveKnowledgeReference = ExecutiveMemoryRecord & {
  memoryKind: "knowledge_reference";
  knowledgeReferenceId: string;
};

export type ExecutiveMemoryState = {
  companyId: string;
  records: ExecutiveMemoryRecord[];
  updatedAt: string;
};

export type BusinessMemoryEntityType =
  | "client"
  | "campaign"
  | "project"
  | "product"
  | "problem"
  | "solution"
  | "meeting"
  | "decision"
  | "strategy"
  | "result";

export type ExecutiveBusinessMemoryEntry = {
  id: string;
  companyId: string;
  entityType: BusinessMemoryEntityType;
  title: string;
  description: string;
  context: string;
  tags: string[];
  memoryRecordId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExecutiveBusinessMemoryStore = {
  companyId: string;
  clients: ExecutiveBusinessMemoryEntry[];
  campaigns: ExecutiveBusinessMemoryEntry[];
  projects: ExecutiveBusinessMemoryEntry[];
  products: ExecutiveBusinessMemoryEntry[];
  problems: ExecutiveBusinessMemoryEntry[];
  solutions: ExecutiveBusinessMemoryEntry[];
  meetings: ExecutiveBusinessMemoryEntry[];
  decisions: ExecutiveBusinessMemoryEntry[];
  strategies: ExecutiveBusinessMemoryEntry[];
  results: ExecutiveBusinessMemoryEntry[];
  updatedAt: string;
};

export type CreateExecutiveMemoryInput = {
  companyId: string;
  userId?: string;
  category: string;
  context?: string;
  content: string;
  origin: string;
  responsibleEngine: string;
  importanceLevel?: number;
  confidenceLevel?: number;
  tags?: string[];
  memoryKind: ExecutiveMemoryKind;
  title: string;
  knowledgeReferenceId?: string;
};

export type MemoryRetrievalInput = {
  companyId: string;
  userId?: string;
  query?: string;
  context?: string;
  category?: string;
  tags?: string[];
  memoryKind?: ExecutiveMemoryKind;
  status?: MemoryLifecycleStatus[];
  limit?: number;
  minImportance?: number;
  minConfidence?: number;
  preferRecency?: boolean;
  preferPriority?: boolean;
};

export type MemoryRetrievalMatch = {
  record: ExecutiveMemoryRecord;
  relevanceScore: number;
  similarityScore: number;
  recencyScore: number;
  priorityScore: number;
};

export type MemoryRetrievalResult = {
  query?: string;
  matches: MemoryRetrievalMatch[];
  totalCandidates: number;
};

export type CreateBusinessMemoryEntryInput = {
  companyId: string;
  entityType: BusinessMemoryEntityType;
  title: string;
  description: string;
  context?: string;
  tags?: string[];
  memoryRecordId?: string;
};
