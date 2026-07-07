import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Permission } from "../entities";

export type PermissionRevokedPayload = {
  permission: ReturnType<Permission["toJSON"]>;
  memberId: string;
  revokedAt: string;
};

export type PermissionRevokedEvent = DomainEvent<PermissionRevokedPayload>;

export function createPermissionRevokedEvent(input: {
  permission: Permission;
  memberId: string;
}): PermissionRevokedEvent {
  return createDomainEvent({
    eventType: "PermissionRevoked",
    aggregateId: input.memberId,
    organizationId: input.permission.organizationId,
    payload: {
      permission: input.permission.toJSON(),
      memberId: input.memberId,
      revokedAt: new Date().toISOString(),
    },
  });
}
