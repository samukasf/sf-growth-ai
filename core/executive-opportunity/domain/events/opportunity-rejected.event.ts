import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessOpportunity } from "../entities";

export type OpportunityRejectedPayload = {
  opportunity: ReturnType<BusinessOpportunity["toJSON"]>;
  rejectedBy: string;
  reason: string;
};

export type OpportunityRejectedEvent = DomainEvent<OpportunityRejectedPayload>;

export function createOpportunityRejectedEvent(
  opportunity: BusinessOpportunity,
  rejectedBy: string,
  reason: string,
): OpportunityRejectedEvent {
  return createDomainEvent({
    eventType: "OpportunityRejected",
    aggregateId: opportunity.id,
    organizationId: opportunity.organizationId,
    companyId: opportunity.companyId,
    payload: { opportunity: opportunity.toJSON(), rejectedBy, reason },
  });
}
