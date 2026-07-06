import type { KnowledgeRecord } from "../../../domain";

export type CompanyBrainSnapshot = {
  companyId: string;
  knowledgeCount: number;
  domains: string[];
  lastUpdatedAt: string;
};

export interface CompanyBrainPort {
  notifyKnowledgeChange(record: KnowledgeRecord): Promise<void>;
  getSnapshot(companyId: string): Promise<CompanyBrainSnapshot | null>;
}
