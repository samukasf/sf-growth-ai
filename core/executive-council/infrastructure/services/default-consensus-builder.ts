import { CouncilConsensus } from "../../domain";
import type { ConsensusBuilder } from "../../domain/ports/consensus-builder.port";
import type { CouncilOpinion } from "../../domain";

export class DefaultConsensusBuilder implements ConsensusBuilder {
  build(sessionId: string, opinions: CouncilOpinion[]) {
    return CouncilConsensus.fromOpinions(
      sessionId,
      opinions.map((o) => o.toJSON()),
    );
  }
}
