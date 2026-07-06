import type { LearningRecord } from "../entities";
import type { Score } from "../../shared";

export type LearningScoreBreakdown = {
  recordId: string;
  overallScore: Score;
  successScore: Score;
  confidenceScore: Score;
  impactScore: Score;
  roiScore: Score;
  feedbackScore: Score;
};

export interface LearningScoreCalculator {
  calculate(record: LearningRecord): LearningScoreBreakdown;
  meetsValidationThreshold(record: LearningRecord, threshold?: Score): boolean;
}
