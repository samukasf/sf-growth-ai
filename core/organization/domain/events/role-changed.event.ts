import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AccessLevel } from "../entities";

export type RoleChangedPayload = {
  memberId: string;
  previousRole: AccessLevel;
  newRole: AccessLevel;
  changedAt: string;
};

export type RoleChangedEvent = DomainEvent<RoleChangedPayload>;

export function createRoleChangedEvent(input: {
  organizationId: string;
  memberId: string;
  previousRole: AccessLevel;
  newRole: AccessLevel;
}): RoleChangedEvent {
  return createDomainEvent({
    eventType: "RoleChanged",
    aggregateId: input.memberId,
    organizationId: input.organizationId,
    payload: {
      memberId: input.memberId,
      previousRole: input.previousRole,
      newRole: input.newRole,
      changedAt: new Date().toISOString(),
    },
  });
}
