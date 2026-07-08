import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientExecutiveStackProps } from "../entities";

export type CompanyBrainActivatedPayload = {
  companyBrainId: string;
  executiveStack: ClientExecutiveStackProps;
};

export type CompanyBrainActivatedEvent = DomainEvent<CompanyBrainActivatedPayload>;

export function createCompanyBrainActivatedEvent(input: {
  organizationId: string;
  agencyId: string;
  companyId: string;
  journeyId?: string;
  companyBrainId: string;
  executiveStack: ClientExecutiveStackProps;
}): CompanyBrainActivatedEvent {
  return createDomainEvent({
    eventType: "CompanyBrainActivated",
    aggregateId: input.companyBrainId,
    organizationId: input.organizationId,
    agencyId: input.agencyId,
    companyId: input.companyId,
    journeyId: input.journeyId,
    payload: {
      companyBrainId: input.companyBrainId,
      executiveStack: input.executiveStack,
    },
  });
}
