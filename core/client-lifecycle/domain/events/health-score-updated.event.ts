import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientHealth } from "../entities";

export type HealthScoreUpdatedPayload = {
  health: ReturnType<ClientHealth["toJSON"]>;
};

export type HealthScoreUpdatedEvent = DomainEvent<HealthScoreUpdatedPayload>;

export function createHealthScoreUpdatedEvent(
  health: ClientHealth,
  journeyId?: string,
): HealthScoreUpdatedEvent {
  return createDomainEvent({
    eventType: "HealthScoreUpdated",
    aggregateId: health.id,
    organizationId: health.organizationId,
    agencyId: health.agencyId,
    companyId: health.companyId,
    journeyId,
    payload: { health: health.toJSON() },
  });
}
