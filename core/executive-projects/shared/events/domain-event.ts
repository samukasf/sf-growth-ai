import type { CompanyId, DomainEventId, ExecutiveProjectId } from "../types";

export type DomainEventType =
  | "ProjectGenerated"
  | "ProjectApproved"
  | "ProjectRejected"
  | "ProjectStarted"
  | "ProjectCompleted";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: ExecutiveProjectId;
  companyId: CompanyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: ExecutiveProjectId;
  companyId: CompanyId;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: input.eventType,
    occurredAt: new Date().toISOString(),
    aggregateId: input.aggregateId,
    companyId: input.companyId,
    payload: input.payload,
  };
}
