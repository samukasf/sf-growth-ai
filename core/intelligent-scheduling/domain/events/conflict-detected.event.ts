import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationId } from "../../shared";

export type ConflictDetectedPayload = {
  entityId: string;
  entityType: string;
  conflictingIds: string[];
  message: string;
};
export type ConflictDetectedEvent = DomainEvent<ConflictDetectedPayload>;

export function createConflictDetectedEvent(input: {
  organizationId: OrganizationId;
  entityId: string;
  entityType: string;
  conflictingIds: string[];
  message: string;
}): ConflictDetectedEvent {
  return createDomainEvent({
    eventType: "ConflictDetected",
    aggregateId: input.entityId,
    organizationId: input.organizationId,
    payload: {
      entityId: input.entityId,
      entityType: input.entityType,
      conflictingIds: input.conflictingIds,
      message: input.message,
    },
  });
}
