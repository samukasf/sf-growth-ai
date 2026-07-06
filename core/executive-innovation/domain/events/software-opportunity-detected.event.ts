import { createDomainEvent, type DomainEvent } from "../../shared";
import type { SoftwareOpportunity } from "../entities";

export type SoftwareOpportunityDetectedPayload = {
  software: ReturnType<SoftwareOpportunity["toJSON"]>;
};

export type SoftwareOpportunityDetectedEvent = DomainEvent<SoftwareOpportunityDetectedPayload>;

export function createSoftwareOpportunityDetectedEvent(
  software: SoftwareOpportunity,
): SoftwareOpportunityDetectedEvent {
  return createDomainEvent({
    eventType: "SoftwareOpportunityDetected",
    aggregateId: software.opportunityId,
    companyId: software.companyId,
    payload: { software: software.toJSON() },
  });
}
