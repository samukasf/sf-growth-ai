import { createDomainEvent, type DomainEvent } from "../../shared";
import type { CouncilDecision } from "../entities";

export type CouncilDecisionCompletedPayload = {
  decision: ReturnType<CouncilDecision["toJSON"]>;
  response: string;
};
export type CouncilDecisionCompletedEvent = DomainEvent<CouncilDecisionCompletedPayload>;

export function createCouncilDecisionCompletedEvent(input: {
  decision: CouncilDecision;
  response: string;
  organizationId: string;
  companyId: string;
}): CouncilDecisionCompletedEvent {
  return createDomainEvent({
    eventType: "CouncilDecisionCompleted",
    aggregateId: input.decision.sessionId,
    organizationId: input.organizationId,
    companyId: input.companyId,
    payload: {
      decision: input.decision.toJSON(),
      response: input.response,
    },
  });
}
