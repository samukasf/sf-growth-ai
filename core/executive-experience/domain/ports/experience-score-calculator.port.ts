import type { ExecutiveExperience } from "../entities";
import type { Score } from "../../shared";

export type ExperienceScoreBreakdown = {
  experienceId: string;
  overallScore: Score;
  successScore: Score;
  impactScore: Score;
  confidenceScore: Score;
  roiScore: Score;
  durationScore: Score;
};

export interface ExperienceScoreCalculator {
  calculate(experience: ExecutiveExperience): ExperienceScoreBreakdown;
  meetsValidationThreshold(experience: ExecutiveExperience, threshold?: Score): boolean;
}
