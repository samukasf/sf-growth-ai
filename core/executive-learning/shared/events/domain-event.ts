import type { CompanyId, DomainEventId, LearningRecordId } from "../types";

export type DomainEventType =
  | "LearningCreated"
  | "LearningUpdated"
  | "PatternDetected"
  | "ExperienceRecorded"
  | "FeedbackReceived"
  | "LearningValidated";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: LearningRecordId;
  companyId: CompanyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: LearningRecordId;
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
