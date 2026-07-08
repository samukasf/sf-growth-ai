import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessDayId, CompanyId, OrganizationId } from "../../shared";

export type BusinessDayStartedPayload = {
  businessDayId: BusinessDayId;
  date: string;
};

export type BusinessDayStartedEvent = DomainEvent<BusinessDayStartedPayload>;

export function createBusinessDayStartedEvent(input: {
  organizationId: OrganizationId;
  companyId: CompanyId;
  agencyId?: string;
  businessDayId: BusinessDayId;
  date: string;
}): BusinessDayStartedEvent {
  return createDomainEvent({
    eventType: "BusinessDayStarted",
    aggregateId: input.businessDayId,
    organizationId: input.organizationId,
    companyId: input.companyId,
    agencyId: input.agencyId,
    businessDayId: input.businessDayId,
    payload: { businessDayId: input.businessDayId, date: input.date },
  });
}
