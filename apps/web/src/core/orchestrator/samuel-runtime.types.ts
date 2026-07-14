import type { MemoryImportance, MemoryType } from "../memory";
import type { OrchestratorResponse } from "./orchestrator.types";

export type SamuelRuntimeMemoryInput = {
  id: string;
  title: string;
  content: string;
  type?: MemoryType | string;
  importance?: MemoryImportance | number | string;
  tags?: string[];
  source?: string | null;
  createdAt?: string;
};

export type SamuelRuntimeCompanyInput = {
  id: string;
  name: string;
  industry?: string | null;
  location?: string | null;
  summary?: string | null;
  profile?: Record<string, unknown>;
  health?: Record<string, number>;
  growthScore?: number | null;
  executiveSummary?: string | null;
  executiveRecommendation?: string | null;
  topPriorities?: string[];
  nextActions?: string[];
  memories?: SamuelRuntimeMemoryInput[];
};

export type SamuelRuntimeInput = {
  query: string;
  tenantId: string;
  companyId: string;
  userId: string;
  sessionId?: string;
  company: SamuelRuntimeCompanyInput;
};

export type SamuelRuntimeResult = {
  response: OrchestratorResponse;
  evidenceCount: number;
  generatedAt: string;
};
