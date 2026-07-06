export type GeneratePlaybookDto = {
  companyId: string;
  wisdomId: string;
};

export type ValidateRecommendationDto = {
  companyId: string;
  patternId: string;
};

export type RecordLessonDto = {
  companyId: string;
  wisdomId: string;
  title: string;
  description: string;
  source: string;
  impact?: number;
};
