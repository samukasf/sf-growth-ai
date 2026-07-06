import type { LearningFeedbackSentiment } from "../../domain";

export type ProcessFeedbackDto = {
  companyId: string;
  recordId: string;
  sentiment: LearningFeedbackSentiment;
  content: string;
  source: string;
  score?: number;
};
