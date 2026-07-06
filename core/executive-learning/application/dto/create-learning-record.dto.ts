import type { LearningOutcomeStatus } from "../../domain";

export type CreateLearningRecordDto = {
  companyId: string;
  knowledgeId?: string;
  eventId?: string;
  decisionId?: string;
  outcomeStatus: LearningOutcomeStatus;
  outcomeDescription: string;
  successLevel?: number;
  confidence?: number;
  impact?: number;
  roi?: number;
  feedback?: string;
  lessonsLearned?: string[];
  recommendations?: string[];
};
