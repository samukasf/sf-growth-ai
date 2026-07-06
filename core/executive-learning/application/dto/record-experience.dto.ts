export type RecordExperienceDto = {
  companyId: string;
  recordId: string;
  title: string;
  context: string;
  actionTaken: string;
  resultSummary: string;
  successLevel?: number;
};
