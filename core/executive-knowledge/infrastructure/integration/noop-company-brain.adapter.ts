import type { CompanyBrainPort, CompanyBrainSnapshot } from "../../application";
import type { KnowledgeRecord } from "../../domain";

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  async notifyKnowledgeChange(record: KnowledgeRecord): Promise<void> {
    void record;
  }

  async getSnapshot(companyId: string): Promise<CompanyBrainSnapshot | null> {
    void companyId;
    return null;
  }
}
