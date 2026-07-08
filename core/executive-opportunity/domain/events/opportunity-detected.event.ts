import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessOpportunity } from "../entities";

export type OpportunityDetectedPayload = {
  opportunity: ReturnType<BusinessOpportunity["toJSON"]>;
};

export type OpportunityDetectedEvent = DomainEvent<OpportunityDetectedPayload>;

export function createOpportunityDetectedEvent(
  opportunity: BusinessOpportunity,
): OpportunityDetectedEvent {
  return createDomainEvent({
    eventType: "OpportunityDetected",
    aggregateId: opportunity.id,
    organizationId: opportunity.organizationId,
    companyId: opportunity.companyId,
    payload: { opportunity: opportunity.toJSON() },
  });
}
