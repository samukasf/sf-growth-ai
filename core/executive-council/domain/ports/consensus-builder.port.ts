import type { CouncilConsensus, CouncilOpinion } from "../entities";

export interface ConsensusBuilder {
  build(sessionId: string, opinions: CouncilOpinion[]): CouncilConsensus;
}
