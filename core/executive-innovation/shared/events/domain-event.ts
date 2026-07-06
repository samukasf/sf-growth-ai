import type { CompanyId, DomainEventId, InnovationOpportunityId } from "../types";

export type DomainEventType =
  | "InnovationOpportunityDetected"
  | "InnovationProjectCreated"
  | "AutomationOpportunityDetected"
  | "SoftwareOpportunityDetected"
  | "InnovationApproved"
  | "InnovationRejected";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: InnovationOpportunityId;
  companyId: CompanyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: InnovationOpportunityId;
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
