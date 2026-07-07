import { createDomainEvent, type DomainEvent } from "../../shared";
import type { RelationshipProfile } from "../entities";

export type RelationshipUpdatedPayload = {
  profile: ReturnType<RelationshipProfile["toJSON"]>;
};
export type RelationshipUpdatedEvent = DomainEvent<RelationshipUpdatedPayload>;

export function createRelationshipUpdatedEvent(
  profile: RelationshipProfile,
): RelationshipUpdatedEvent {
  return createDomainEvent({
    eventType: "RelationshipUpdated",
    aggregateId: profile.id,
    organizationId: profile.organizationId,
    payload: { profile: profile.toJSON() },
  });
}
