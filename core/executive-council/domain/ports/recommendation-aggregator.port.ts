import type { CouncilConsensus, CouncilOpinion, CouncilRecommendation } from "../entities";

export interface RecommendationAggregator {
  aggregate(
    sessionId: string,
    consensus: CouncilConsensus,
    opinions: CouncilOpinion[],
  ): CouncilRecommendation[];
}
