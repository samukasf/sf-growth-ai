import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessOpportunity } from "../entities";

export type OpportunityApprovedPayload = {
  opportunity: ReturnType<BusinessOpportunity["toJSON"]>;
  approvedBy: string;
};

export type OpportunityApprovedEvent = DomainEvent<OpportunityApprovedPayload>;

export function createOpportunityApprovedEvent(
  opportunity: BusinessOpportunity,
  approvedBy: string,
): OpportunityApprovedEvent {
  return createDomainEvent({
    eventType: "OpportunityApproved",
    aggregateId: opportunity.id,
    organizationId: opportunity.organizationId,
    companyId: opportunity.companyId,
    payload: { opportunity: opportunity.toJSON(), approvedBy },
  });
}
