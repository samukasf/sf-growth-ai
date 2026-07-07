import { createDomainEvent, type DomainEvent } from "../../shared";
import type { CouncilSession } from "../entities";

export type CouncilSessionStartedPayload = {
  session: ReturnType<CouncilSession["toJSON"]>;
};
export type CouncilSessionStartedEvent = DomainEvent<CouncilSessionStartedPayload>;

export function createCouncilSessionStartedEvent(
  session: CouncilSession,
): CouncilSessionStartedEvent {
  return createDomainEvent({
    eventType: "CouncilSessionStarted",
    aggregateId: session.id,
    organizationId: session.organizationId,
    companyId: session.companyId,
    payload: { session: session.toJSON() },
  });
}
