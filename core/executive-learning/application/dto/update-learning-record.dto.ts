export type UpdateLearningRecordDto = {
  recordId: string;
  successLevel?: number;
  confidence?: number;
  impact?: number;
  roi?: number;
  feedback?: string;
  lessonsLearned?: string[];
  recommendations?: string[];
};
