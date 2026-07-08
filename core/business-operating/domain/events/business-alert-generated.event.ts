import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessAlert } from "../entities";

export type BusinessAlertGeneratedPayload = {
  alert: ReturnType<BusinessAlert["toJSON"]>;
};

export type BusinessAlertGeneratedEvent = DomainEvent<BusinessAlertGeneratedPayload>;

export function createBusinessAlertGeneratedEvent(
  alert: BusinessAlert,
  businessDayId?: string,
): BusinessAlertGeneratedEvent {
  return createDomainEvent({
    eventType: "BusinessAlertGenerated",
    aggregateId: alert.id,
    organizationId: alert.organizationId,
    companyId: alert.companyId,
    agencyId: alert.agencyId,
    businessDayId,
    payload: { alert: alert.toJSON() },
  });
}
