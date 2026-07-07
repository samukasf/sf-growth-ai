import type { AssessmentDimension, AssessmentRecommendation } from "../entities";
import type { AssessmentId } from "../../shared";
import type { CompositeScores } from "./score-calculator.port";

export type GenerateRecommendationsInput = {
  assessmentId: AssessmentId;
  dimensions: AssessmentDimension[];
  composite: CompositeScores;
};

export interface RecommendationEngine {
  generate(input: GenerateRecommendationsInput): AssessmentRecommendation[];
}
