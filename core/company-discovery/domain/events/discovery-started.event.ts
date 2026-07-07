import { createDomainEvent, type DomainEvent } from "../../shared";
import type { DiscoverySession } from "../entities";

export type DiscoveryStartedPayload = {
  session: ReturnType<DiscoverySession["toJSON"]>;
};

export type DiscoveryStartedEvent = DomainEvent<DiscoveryStartedPayload>;

export function createDiscoveryStartedEvent(
  session: DiscoverySession,
): DiscoveryStartedEvent {
  return createDomainEvent({
    eventType: "DiscoveryStarted",
    aggregateId: session.id,
    organizationId: session.organizationId,
    companyId: session.companyId,
    payload: { session: session.toJSON() },
  });
}
