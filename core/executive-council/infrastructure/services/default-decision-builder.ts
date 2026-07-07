import { CouncilDecision } from "../../domain";
import type { DecisionBuilder } from "../../domain/ports/decision-builder.port";
import type { CouncilConsensus } from "../../domain";

export class DefaultDecisionBuilder implements DecisionBuilder {
  build(sessionId: string, consensus: CouncilConsensus) {
    return CouncilDecision.create({
      sessionId,
      consensusId: consensus.id,
      decision: consensus.consolidatedRecommendation,
      rationale: consensus.consolidatedSummary,
      confidence: consensus.averageConfidence,
      approvedByCeo: true,
    });
  }
}
