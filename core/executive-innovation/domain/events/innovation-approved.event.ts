import { createDomainEvent, type DomainEvent } from "../../shared";
import type { InnovationOpportunity } from "../entities";

export type InnovationApprovedPayload = {
  opportunity: ReturnType<InnovationOpportunity["toJSON"]>;
  approvedAt: string;
};

export type InnovationApprovedEvent = DomainEvent<InnovationApprovedPayload>;

export function createInnovationApprovedEvent(
  opportunity: InnovationOpportunity,
): InnovationApprovedEvent {
  return createDomainEvent({
    eventType: "InnovationApproved",
    aggregateId: opportunity.id,
    companyId: opportunity.companyId,
    payload: {
      opportunity: opportunity.toJSON(),
      approvedAt: new Date().toISOString(),
    },
  });
}
