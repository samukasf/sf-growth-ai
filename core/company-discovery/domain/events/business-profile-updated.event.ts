import { createDomainEvent, type DomainEvent } from "../../shared";
import type { CompanyProfile } from "../entities";

export type BusinessProfileUpdatedPayload = {
  profile: ReturnType<CompanyProfile["toJSON"]>;
};

export type BusinessProfileUpdatedEvent = DomainEvent<BusinessProfileUpdatedPayload>;

export function createBusinessProfileUpdatedEvent(
  profile: CompanyProfile,
): BusinessProfileUpdatedEvent {
  return createDomainEvent({
    eventType: "BusinessProfileUpdated",
    aggregateId: profile.id,
    organizationId: profile.organizationId,
    companyId: profile.companyId,
    payload: { profile: profile.toJSON() },
  });
}
