import type { CompanyId, OrganizationId } from "../../shared";
import { createDomainEvent, type DomainEvent } from "../../shared";
import type { DiscoveryGap } from "../entities";

export type GapDetectedPayload = {
  gap: ReturnType<DiscoveryGap["toJSON"]>;
};

export type GapDetectedEvent = DomainEvent<GapDetectedPayload>;

export function createGapDetectedEvent(
  gap: DiscoveryGap,
  organizationId: OrganizationId,
  companyId: CompanyId,
): GapDetectedEvent {
  return createDomainEvent({
    eventType: "GapDetected",
    aggregateId: gap.sessionId,
    organizationId,
    companyId,
    payload: { gap: gap.toJSON() },
  });
}
