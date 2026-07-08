import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessOpportunity } from "../entities";

export type OpportunityUpdatedPayload = {
  opportunity: ReturnType<BusinessOpportunity["toJSON"]>;
  changes: string[];
};

export type OpportunityUpdatedEvent = DomainEvent<OpportunityUpdatedPayload>;

export function createOpportunityUpdatedEvent(
  opportunity: BusinessOpportunity,
  changes: string[],
): OpportunityUpdatedEvent {
  return createDomainEvent({
    eventType: "OpportunityUpdated",
    aggregateId: opportunity.id,
    organizationId: opportunity.organizationId,
    companyId: opportunity.companyId,
    payload: { opportunity: opportunity.toJSON(), changes },
  });
}
