import { createDomainEvent, type DomainEvent } from "../../shared";
import type { DiscoverySession } from "../entities";

export type DiscoveryCompletedPayload = {
  session: ReturnType<DiscoverySession["toJSON"]>;
};

export type DiscoveryCompletedEvent = DomainEvent<DiscoveryCompletedPayload>;

export function createDiscoveryCompletedEvent(
  session: DiscoverySession,
): DiscoveryCompletedEvent {
  return createDomainEvent({
    eventType: "DiscoveryCompleted",
    aggregateId: session.id,
    organizationId: session.organizationId,
    companyId: session.companyId,
    payload: { session: session.toJSON() },
  });
}
