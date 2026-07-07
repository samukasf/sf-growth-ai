import type { AssessmentRecommendation } from "../entities";

export type PrioritizedItem = {
  recommendation: AssessmentRecommendation;
  priorityScore: number;
  rank: number;
};

export type AnalyzePrioritiesInput = {
  recommendations: AssessmentRecommendation[];
};

export interface PriorityAnalyzer {
  analyze(input: AnalyzePrioritiesInput): PrioritizedItem[];
}
