import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Opportunity } from "../entities";

export type OpportunityCreatedPayload = { opportunity: ReturnType<Opportunity["toJSON"]> };
export type OpportunityCreatedEvent = DomainEvent<OpportunityCreatedPayload>;

export function createOpportunityCreatedEvent(
  opportunity: Opportunity,
): OpportunityCreatedEvent {
  return createDomainEvent({
    eventType: "OpportunityCreated",
    aggregateId: opportunity.id,
    organizationId: opportunity.organizationId,
    payload: { opportunity: opportunity.toJSON() },
  });
}
