import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientRelationship } from "../entities";

export type ClientRecoveredPayload = {
  relationship: ReturnType<ClientRelationship["toJSON"]>;
};

export type ClientRecoveredEvent = DomainEvent<ClientRecoveredPayload>;

export function createClientRecoveredEvent(
  relationship: ClientRelationship,
  journeyId?: string,
): ClientRecoveredEvent {
  return createDomainEvent({
    eventType: "ClientRecovered",
    aggregateId: relationship.id,
    organizationId: relationship.organizationId,
    agencyId: relationship.agencyId,
    companyId: relationship.companyId,
    journeyId,
    payload: { relationship: relationship.toJSON() },
  });
}
