import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AgencyClient } from "../entities";

export type ClientAddedPayload = {
  client: ReturnType<AgencyClient["toJSON"]>;
};

export type ClientAddedEvent = DomainEvent<ClientAddedPayload>;

export function createClientAddedEvent(client: AgencyClient): ClientAddedEvent {
  return createDomainEvent({
    eventType: "ClientAdded",
    aggregateId: client.id,
    organizationId: client.organizationId,
    agencyId: client.agencyId,
    companyId: client.companyId,
    clientId: client.id,
    payload: { client: client.toJSON() },
  });
}
