import { CouncilRecommendation } from "../../domain";
import type { RecommendationAggregator } from "../../domain/ports/recommendation-aggregator.port";
import type { CouncilConsensus, CouncilOpinion } from "../../domain";

export class DefaultRecommendationAggregator implements RecommendationAggregator {
  aggregate(sessionId: string, _consensus: CouncilConsensus, opinions: CouncilOpinion[]) {
    const topOpinions = [...opinions]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    return topOpinions.map((opinion) =>
      CouncilRecommendation.create({
        sessionId,
        title: `${opinion.role} recommendation`,
        description: opinion.recommendation,
        sourceRoles: [opinion.role],
        priority: opinion.priority,
        confidence: opinion.confidence,
        actionItems: opinion.opportunities.length > 0 ? opinion.opportunities : [opinion.recommendation],
      }),
    );
  }
}
