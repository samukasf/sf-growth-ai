import { createDomainEvent, type DomainEvent } from "../../shared";
import type { CouncilConsensus } from "../entities";

export type ConsensusReachedPayload = {
  consensus: ReturnType<CouncilConsensus["toJSON"]>;
};
export type ConsensusReachedEvent = DomainEvent<ConsensusReachedPayload>;

export function createConsensusReachedEvent(
  consensus: CouncilConsensus,
  organizationId: string,
  companyId: string,
): ConsensusReachedEvent {
  return createDomainEvent({
    eventType: "ConsensusReached",
    aggregateId: consensus.sessionId,
    organizationId,
    companyId,
    payload: { consensus: consensus.toJSON() },
  });
}
