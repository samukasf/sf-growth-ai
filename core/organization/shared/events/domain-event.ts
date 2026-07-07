import type { DomainEventId, OrganizationId } from "../types";

export type DomainEventType =
  | "OrganizationCreated"
  | "MemberInvited"
  | "MemberActivated"
  | "RoleChanged"
  | "PermissionGranted"
  | "PermissionRevoked"
  | "DepartmentCreated"
  | "ApprovalRequested"
  | "ApprovalGranted"
  | "ApprovalRejected";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: string;
  organizationId: OrganizationId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: string;
  organizationId: OrganizationId;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: input.eventType,
    occurredAt: new Date().toISOString(),
    aggregateId: input.aggregateId,
    organizationId: input.organizationId,
    payload: input.payload,
  };
}
