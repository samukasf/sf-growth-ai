import type { AutomationId, DomainEventId, OrganizationId } from "../types";

export type DomainEventType =
  | "AutomationCreated"
  | "AutomationExecuted"
  | "AutomationFailed"
  | "AutomationApproved"
  | "AutomationCancelled"
  | "AutomationCompleted";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: AutomationId;
  organizationId: OrganizationId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: AutomationId;
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
