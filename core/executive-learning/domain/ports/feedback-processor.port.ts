import type { LearningFeedback, LearningRecord } from "../entities";

export type FeedbackProcessingResult = {
  feedback: ReturnType<LearningFeedback["toJSON"]>;
  updatedRecord: ReturnType<LearningRecord["toJSON"]>;
  appliedLessons: string[];
};

export interface FeedbackProcessor {
  process(record: LearningRecord, feedback: LearningFeedback): FeedbackProcessingResult;
}
