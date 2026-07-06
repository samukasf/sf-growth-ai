export type CompleteBusinessCaseDto = {
  companyId: string;
  caseId: string;
};

export type ValidateExperienceDto = {
  experienceId: string;
};

export type MatchScenariosDto = {
  companyId: string;
  experienceId: string;
};

export type DetectPatternsDto = {
  companyId: string;
};
