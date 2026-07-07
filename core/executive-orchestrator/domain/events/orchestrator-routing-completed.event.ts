import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveRequestId, ExecutiveParticipantId } from "../../shared";
import type { RoutingResult } from "../ports/executive-routing-engine.port";

export type OrchestratorRoutingCompletedPayload = {
  requestId: ExecutiveRequestId;
  organizationId: string;
  routing: RoutingResult;
  participants: ExecutiveParticipantId[];
};

export type OrchestratorRoutingCompletedEvent = DomainEvent<OrchestratorRoutingCompletedPayload>;

export function createOrchestratorRoutingCompletedEvent(input: {
  requestId: ExecutiveRequestId;
  organizationId: string;
  companyId: string;
  routing: RoutingResult;
  participants: ExecutiveParticipantId[];
}): OrchestratorRoutingCompletedEvent {
  return createDomainEvent({
    eventType: "OrchestratorRoutingCompleted",
    aggregateId: input.requestId,
    companyId: input.companyId,
    payload: {
      requestId: input.requestId,
      organizationId: input.organizationId,
      routing: input.routing,
      participants: input.participants,
    },
  });
}
