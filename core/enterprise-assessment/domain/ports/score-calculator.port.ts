import type { AssessmentAnswer, AssessmentDimension, AssessmentScore } from "../entities";
import type { AssessmentId } from "../../shared";

export type CompositeScores = {
  enterpriseMaturityScore: number;
  businessHealthScore: number;
  automationScore: number;
  digitalMaturityScore: number;
  aiReadinessScore: number;
  operationalEfficiencyScore: number;
  customerExperienceScore: number;
};

export type CalculateScoresInput = {
  assessmentId: AssessmentId;
  dimensions: AssessmentDimension[];
  answers: AssessmentAnswer[];
};

export type CalculateScoresResult = {
  dimensions: AssessmentDimension[];
  composite: CompositeScores;
  assessmentScore: AssessmentScore;
};

export interface ScoreCalculator {
  calculate(input: CalculateScoresInput): CalculateScoresResult;
}
