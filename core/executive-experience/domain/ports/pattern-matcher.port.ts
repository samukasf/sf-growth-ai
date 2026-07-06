import type { ExecutiveExperience, ExperiencePattern } from "../entities";

export type PatternMatch = {
  pattern: ExperiencePattern;
  score: number;
  matchedExperiences: ExecutiveExperience[];
};

export interface PatternMatcher {
  detectPatterns(experiences: ExecutiveExperience[]): ExperiencePattern[];
  findSimilarCases(
    target: ExecutiveExperience,
    candidates: ExecutiveExperience[],
  ): ExecutiveExperience[];
  findRecurringProblems(experiences: ExecutiveExperience[]): ExperiencePattern[];
  findReusableSolutions(experiences: ExecutiveExperience[]): ExperiencePattern[];
  findSimilarProjects(
    target: ExecutiveExperience,
    candidates: ExecutiveExperience[],
  ): ExecutiveExperience[];
  findBestPractices(experiences: ExecutiveExperience[]): ExperiencePattern[];
  findSuccessPatterns(experiences: ExecutiveExperience[]): ExperiencePattern[];
  findFailurePatterns(experiences: ExecutiveExperience[]): ExperiencePattern[];
}
