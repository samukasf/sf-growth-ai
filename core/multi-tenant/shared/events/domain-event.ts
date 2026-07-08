import type { AgencyId, DomainEventId, OrganizationId, TenantId } from "../types";

export type DomainEventType =
  | "TenantCreated"
  | "TenantActivated"
  | "TenantSuspended"
  | "TenantArchived"
  | "TenantDeleted";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: TenantId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: TenantId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: input.eventType,
    occurredAt: new Date().toISOString(),
    aggregateId: input.aggregateId,
    organizationId: input.organizationId,
    agencyId: input.agencyId,
    tenantId: input.tenantId,
    payload: input.payload,
  };
}
