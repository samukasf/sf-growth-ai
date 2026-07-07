import type { CouncilConsensus, CouncilDecision } from "../entities";

export interface DecisionBuilder {
  build(sessionId: string, consensus: CouncilConsensus): CouncilDecision;
}
