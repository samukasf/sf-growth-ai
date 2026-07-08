import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessOpportunity } from "../entities";

export type OpportunityExecutedPayload = {
  opportunity: ReturnType<BusinessOpportunity["toJSON"]>;
  executedBy: string;
};

export type OpportunityExecutedEvent = DomainEvent<OpportunityExecutedPayload>;

export function createOpportunityExecutedEvent(
  opportunity: BusinessOpportunity,
  executedBy: string,
): OpportunityExecutedEvent {
  return createDomainEvent({
    eventType: "OpportunityExecuted",
    aggregateId: opportunity.id,
    organizationId: opportunity.organizationId,
    companyId: opportunity.companyId,
    payload: { opportunity: opportunity.toJSON(), executedBy },
  });
}
