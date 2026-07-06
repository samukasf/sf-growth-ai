import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveConsensus } from "../entities";

export type ExecutiveConsensusCompletedPayload = {
  consensus: ReturnType<ExecutiveConsensus["toJSON"]>;
};

export type ExecutiveConsensusCompletedEvent = DomainEvent<ExecutiveConsensusCompletedPayload>;

export function createExecutiveConsensusCompletedEvent(
  consensus: ExecutiveConsensus,
): ExecutiveConsensusCompletedEvent {
  return createDomainEvent({
    eventType: "ExecutiveConsensusCompleted",
    aggregateId: consensus.requestId,
    companyId: consensus.companyId,
    payload: { consensus: consensus.toJSON() },
  });
}
