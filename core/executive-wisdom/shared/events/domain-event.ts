import type { CompanyId, DomainEventId, WisdomId } from "../types";

export type DomainEventType =
  | "WisdomCreated"
  | "WisdomUpdated"
  | "PlaybookGenerated"
  | "BusinessRuleCreated"
  | "LessonLearned"
  | "RecommendationValidated";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: WisdomId;
  companyId: CompanyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: WisdomId;
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
