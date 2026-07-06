import type { ExecutiveRecommendationPattern, ExecutiveWisdom } from "../entities";

export interface RecommendationEngine {
  generatePatterns(wisdom: ExecutiveWisdom): ExecutiveRecommendationPattern[];
  prioritize(
    patterns: ExecutiveRecommendationPattern[],
  ): ExecutiveRecommendationPattern[];
}
