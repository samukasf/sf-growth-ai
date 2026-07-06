import {
  ExecutiveRecommendationPattern,
  type ExecutiveWisdom,
  type RecommendationEngine,
} from "../../domain";

const PRIORITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 } as const;

export class DefaultRecommendationEngine implements RecommendationEngine {
  generatePatterns(wisdom: ExecutiveWisdom): ExecutiveRecommendationPattern[] {
    const priority =
      wisdom.risk === "critical" || wisdom.risk === "high"
        ? "high"
        : wisdom.importance >= 70
          ? "medium"
          : "low";

    return [
      ExecutiveRecommendationPattern.create({
        companyId: wisdom.companyId,
        wisdomId: wisdom.id,
        title: wisdom.recommendation.slice(0, 80),
        description: wisdom.expectedOutcome || wisdom.reasoning,
        priority,
        confidence: wisdom.confidence,
      }),
    ];
  }

  prioritize(
    patterns: ExecutiveRecommendationPattern[],
  ): ExecutiveRecommendationPattern[] {
    return [...patterns].sort((left, right) => {
      const priorityDiff = PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return right.confidence - left.confidence;
    });
  }
}
