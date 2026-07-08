import type {
  AgencyId,
  ClientJourneyId,
  CompanyId,
  DomainEventId,
  OrganizationId,
} from "../types";

export type DomainEventType =
  | "LeadCreated"
  | "ProposalAccepted"
  | "ClientOnboarded"
  | "CompanyBrainActivated"
  | "HealthScoreUpdated"
  | "RenewalSuggested"
  | "UpsellDetected"
  | "ClientRecovered";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: string;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId?: CompanyId;
  journeyId?: ClientJourneyId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: string;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId?: CompanyId;
  journeyId?: ClientJourneyId;
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
    journeyId: input.journeyId,
    payload: input.payload,
  };
}
