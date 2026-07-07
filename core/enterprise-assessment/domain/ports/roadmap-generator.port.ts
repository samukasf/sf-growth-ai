import type { AssessmentRecommendation, AssessmentRoadmap } from "../entities";
import type { AssessmentId } from "../../shared";
import type { CompositeScores } from "./score-calculator.port";

export type GenerateRoadmapInput = {
  assessmentId: AssessmentId;
  companyName: string;
  composite: CompositeScores;
  recommendations: AssessmentRecommendation[];
};

export interface RoadmapGenerator {
  generate(input: GenerateRoadmapInput): AssessmentRoadmap;
}
