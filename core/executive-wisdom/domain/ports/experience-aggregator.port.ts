import type { ExecutiveExperience, ExecutiveWisdom } from "../entities";
import type { Score } from "../../shared";

export type WisdomExperienceAggregation = {
  companyId: string;
  totalExperiences: number;
  averageSuccessLevel: Score;
  topWisdomIds: string[];
  recentExperiences: ExecutiveExperience[];
};

export interface ExperienceAggregator {
  aggregate(
    companyId: string,
    wisdomItems: ExecutiveWisdom[],
    experiences: ExecutiveExperience[],
  ): WisdomExperienceAggregation;
}
