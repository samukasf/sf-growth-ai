import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Permission } from "../entities";

export type PermissionGrantedPayload = {
  permission: ReturnType<Permission["toJSON"]>;
  memberId: string;
  grantedAt: string;
};

export type PermissionGrantedEvent = DomainEvent<PermissionGrantedPayload>;

export function createPermissionGrantedEvent(input: {
  permission: Permission;
  memberId: string;
}): PermissionGrantedEvent {
  return createDomainEvent({
    eventType: "PermissionGranted",
    aggregateId: input.memberId,
    organizationId: input.permission.organizationId,
    payload: {
      permission: input.permission.toJSON(),
      memberId: input.memberId,
      grantedAt: new Date().toISOString(),
    },
  });
}
