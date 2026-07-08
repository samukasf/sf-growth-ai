import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Agency } from "../entities";

export type AgencyCreatedPayload = {
  agency: ReturnType<Agency["toJSON"]>;
};

export type AgencyCreatedEvent = DomainEvent<AgencyCreatedPayload>;

export function createAgencyCreatedEvent(agency: Agency): AgencyCreatedEvent {
  return createDomainEvent({
    eventType: "AgencyCreated",
    aggregateId: agency.id,
    organizationId: agency.organizationId,
    agencyId: agency.id,
    payload: { agency: agency.toJSON() },
  });
}
