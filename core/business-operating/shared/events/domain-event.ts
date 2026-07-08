import type {
  AgencyId,
  BusinessDayId,
  CompanyId,
  DomainEventId,
  OrganizationId,
} from "../types";

export type DomainEventType =
  | "BusinessDayStarted"
  | "PriorityCalculated"
  | "RoutineCreated"
  | "BusinessAlertGenerated"
  | "BusinessReviewCompleted"
  | "BusinessDayFinished";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: string;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  businessDayId?: BusinessDayId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: string;
  organizationId: OrganizationId;
  companyId: CompanyId;
  agencyId?: AgencyId;
  businessDayId?: BusinessDayId;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: input.eventType,
    occurredAt: new Date().toISOString(),
    aggregateId: input.aggregateId,
    organizationId: input.organizationId,
    agencyId: input.agencyId,
    companyId: input.companyId,
    businessDayId: input.businessDayId,
    payload: input.payload,
  };
}
