import type { CompanyId, DomainEventId, KnowledgeRecordId } from "../types";

export type DomainEventType =
  | "KnowledgeCreated"
  | "KnowledgeUpdated"
  | "KnowledgeValidated"
  | "KnowledgeLinked"
  | "KnowledgeArchived";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: KnowledgeRecordId;
  companyId: CompanyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: KnowledgeRecordId;
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
