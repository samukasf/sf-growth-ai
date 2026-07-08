import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientUpsell } from "../entities";

export type UpsellDetectedPayload = {
  upsell: ReturnType<ClientUpsell["toJSON"]>;
};

export type UpsellDetectedEvent = DomainEvent<UpsellDetectedPayload>;

export function createUpsellDetectedEvent(
  upsell: ClientUpsell,
  journeyId?: string,
): UpsellDetectedEvent {
  return createDomainEvent({
    eventType: "UpsellDetected",
    aggregateId: upsell.id,
    organizationId: upsell.organizationId,
    agencyId: upsell.agencyId,
    companyId: upsell.companyId,
    journeyId,
    payload: { upsell: upsell.toJSON() },
  });
}
