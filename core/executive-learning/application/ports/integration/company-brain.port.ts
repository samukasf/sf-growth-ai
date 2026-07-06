import type { LearningRecord } from "../../../domain";

export type CompanyBrainLearningSnapshot = {
  companyId: string;
  learningCount: number;
  averageSuccessLevel: number;
  lastUpdatedAt: string;
};

export interface CompanyBrainPort {
  notifyLearningChange(record: LearningRecord): Promise<void>;
  getLearningSnapshot(companyId: string): Promise<CompanyBrainLearningSnapshot | null>;
}
