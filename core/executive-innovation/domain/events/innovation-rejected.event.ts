import { createDomainEvent, type DomainEvent } from "../../shared";
import type { InnovationOpportunity } from "../entities";

export type InnovationRejectedPayload = {
  opportunity: ReturnType<InnovationOpportunity["toJSON"]>;
  rejectedAt: string;
};

export type InnovationRejectedEvent = DomainEvent<InnovationRejectedPayload>;

export function createInnovationRejectedEvent(
  opportunity: InnovationOpportunity,
): InnovationRejectedEvent {
  return createDomainEvent({
    eventType: "InnovationRejected",
    aggregateId: opportunity.id,
    companyId: opportunity.companyId,
    payload: {
      opportunity: opportunity.toJSON(),
      rejectedAt: new Date().toISOString(),
    },
  });
}
