import type { CompanyId, OrganizationId } from "../../shared";
import { createDomainEvent, type DomainEvent } from "../../shared";
import type { DiscoveryOpportunity } from "../entities";

export type OpportunityDetectedPayload = {
  opportunity: ReturnType<DiscoveryOpportunity["toJSON"]>;
};

export type OpportunityDetectedEvent = DomainEvent<OpportunityDetectedPayload>;

export function createOpportunityDetectedEvent(
  opportunity: DiscoveryOpportunity,
  organizationId: OrganizationId,
  companyId: CompanyId,
): OpportunityDetectedEvent {
  return createDomainEvent({
    eventType: "OpportunityDetected",
    aggregateId: opportunity.sessionId,
    organizationId,
    companyId,
    payload: { opportunity: opportunity.toJSON() },
  });
}
