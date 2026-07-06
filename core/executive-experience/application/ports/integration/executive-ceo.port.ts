export type ExecutiveCEOExperienceBriefing = {
  companyId: string;
  headline: string;
  highlights: string[];
  experienceId: string;
};

export interface ExecutiveCEOPort {
  notifyExperienceInsight(briefing: ExecutiveCEOExperienceBriefing): Promise<void>;
}
