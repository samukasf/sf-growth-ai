import type { LearningRecord } from "../../../domain";

export type ExecutiveRecommendationCandidate = {
  companyId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  sourceRecordId: string;
};

export interface ExecutiveRecommendationPort {
  proposeFromLearning(record: LearningRecord): Promise<ExecutiveRecommendationCandidate[]>;
  registerRecommendations(candidates: ExecutiveRecommendationCandidate[]): Promise<void>;
}
