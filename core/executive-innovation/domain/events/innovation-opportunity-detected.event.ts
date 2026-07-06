import { createDomainEvent, type DomainEvent } from "../../shared";
import type { InnovationOpportunity } from "../entities";

export type InnovationOpportunityDetectedPayload = {
  opportunity: ReturnType<InnovationOpportunity["toJSON"]>;
};

export type InnovationOpportunityDetectedEvent = DomainEvent<InnovationOpportunityDetectedPayload>;

export function createInnovationOpportunityDetectedEvent(
  opportunity: InnovationOpportunity,
): InnovationOpportunityDetectedEvent {
  return createDomainEvent({
    eventType: "InnovationOpportunityDetected",
    aggregateId: opportunity.id,
    companyId: opportunity.companyId,
    payload: { opportunity: opportunity.toJSON() },
  });
}
