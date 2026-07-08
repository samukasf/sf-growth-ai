import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessDayId, CompanyId, OrganizationId } from "../../shared";

export type BusinessDayFinishedPayload = {
  businessDayId: BusinessDayId;
  date: string;
  reviewId?: string;
};

export type BusinessDayFinishedEvent = DomainEvent<BusinessDayFinishedPayload>;

export function createBusinessDayFinishedEvent(input: {
  organizationId: OrganizationId;
  companyId: CompanyId;
  agencyId?: string;
  businessDayId: BusinessDayId;
  date: string;
  reviewId?: string;
}): BusinessDayFinishedEvent {
  return createDomainEvent({
    eventType: "BusinessDayFinished",
    aggregateId: input.businessDayId,
    organizationId: input.organizationId,
    companyId: input.companyId,
    agencyId: input.agencyId,
    businessDayId: input.businessDayId,
    payload: {
      businessDayId: input.businessDayId,
      date: input.date,
      reviewId: input.reviewId,
    },
  });
}
