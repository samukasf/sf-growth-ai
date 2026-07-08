import type { CompanyId, DomainEventId, ExecutiveProjectId, OrganizationId } from "../types";

export type DomainEventType =
  | "ProjectGenerated"
  | "BusinessCaseCreated"
  | "RoadmapCreated"
  | "ProjectApproved"
  | "ProjectRejected"
  | "ProjectStarted";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: ExecutiveProjectId | string;
  organizationId: OrganizationId;
  companyId: CompanyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: ExecutiveProjectId | string;
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

