import type { ExecutiveExperience } from "../entities";
import type { Score } from "../../shared";

export type ExperienceAnalysisReport = {
  experienceId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  reusableInsights: string[];
  decisionReadiness: Score;
};

export interface ExperienceAnalyzer {
  analyze(experience: ExecutiveExperience): ExperienceAnalysisReport;
  analyzeBatch(experiences: ExecutiveExperience[]): ExperienceAnalysisReport[];
}
