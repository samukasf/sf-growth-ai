import type {
  CompanyBrainLearningSnapshot,
  CompanyBrainPort,
} from "../../application";
import type { LearningRecord } from "../../domain";

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  async notifyLearningChange(record: LearningRecord): Promise<void> {
    void record;
  }

  async getLearningSnapshot(companyId: string): Promise<CompanyBrainLearningSnapshot | null> {
    void companyId;
    return null;
  }
}
