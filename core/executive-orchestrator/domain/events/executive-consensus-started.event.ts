import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveConsensus } from "../entities";

export type ExecutiveConsensusStartedPayload = {
  consensusId: string;
  requestId: string;
  participantCount: number;
  startedAt: string;
};

export type ExecutiveConsensusStartedEvent = DomainEvent<ExecutiveConsensusStartedPayload>;

export function createExecutiveConsensusStartedEvent(
  consensus: ExecutiveConsensus,
): ExecutiveConsensusStartedEvent {
  return createDomainEvent({
    eventType: "ExecutiveConsensusStarted",
    aggregateId: consensus.requestId,
    companyId: consensus.companyId,
    payload: {
      consensusId: consensus.id,
      requestId: consensus.requestId,
      participantCount: consensus.contributions.length,
      startedAt: new Date().toISOString(),
    },
  });
}
