import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AgencyClient } from "../entities";

export type ClientRemovedPayload = {
  client: ReturnType<AgencyClient["toJSON"]>;
};

export type ClientRemovedEvent = DomainEvent<ClientRemovedPayload>;

export function createClientRemovedEvent(client: AgencyClient): ClientRemovedEvent {
  return createDomainEvent({
    eventType: "ClientRemoved",
    aggregateId: client.id,
    organizationId: client.organizationId,
    agencyId: client.agencyId,
    companyId: client.companyId,
    clientId: client.id,
    payload: { client: client.toJSON() },
  });
}
