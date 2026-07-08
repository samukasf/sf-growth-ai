import type { BusinessOpportunity, OpportunityRecommendation } from "../entities";

export type RecommendationBuildInput = {
  opportunity: BusinessOpportunity;
  impactScore?: number;
  riskLevel?: string;
};

export type RecommendationBuildOutput = {
  recommendations: OpportunityRecommendation[];
  recommendedActions: { id: string; label: string; department?: string; order: number }[];
};

export interface RecommendationBuilder {
  build(input: RecommendationBuildInput): RecommendationBuildOutput;
}
