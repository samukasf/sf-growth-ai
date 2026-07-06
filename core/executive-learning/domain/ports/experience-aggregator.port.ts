import type { LearningExperience, LearningRecord } from "../entities";
import type { Score } from "../../shared";

export type ExperienceAggregation = {
  companyId: string;
  totalExperiences: number;
  averageSuccessLevel: Score;
  topLessons: string[];
  recentExperiences: LearningExperience[];
};

export interface ExperienceAggregator {
  aggregate(
    companyId: string,
    records: LearningRecord[],
    experiences: LearningExperience[],
  ): ExperienceAggregation;
}
