import type { LearningRecord } from "../../../domain";

export type ExecutiveCEOBriefingUpdate = {
  companyId: string;
  headline: string;
  learningHighlights: string[];
  recordId: string;
};

export interface ExecutiveCEOPort {
  notifyLearningInsight(update: ExecutiveCEOBriefingUpdate): Promise<void>;
  summarizeLearningImpact(records: LearningRecord[]): Promise<string[]>;
}
