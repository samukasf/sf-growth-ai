import type { BrainSnapshotId, CompanyId, DomainEventId, OrganizationId } from "../types";

export type DomainEventType =
  | "BrainSnapshotCreated"
  | "BrainSnapshotUpdated"
  | "BrainStateChanged"
  | "BrainSignalProcessed"
  | "BrainHealthAnalyzed";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: BrainSnapshotId | string;
  organizationId: OrganizationId;
  companyId: CompanyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: BrainSnapshotId | string;
  organizationId: OrganizationId;
  companyId: CompanyId;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: input.eventType,
    occurredAt: new Date().toISOString(),
    aggregateId: input.aggregateId,
    organizationId: input.organizationId,
    companyId: input.companyId,
    payload: input.payload,
  };
}
