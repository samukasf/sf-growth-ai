import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessState } from "../entities";

export type BusinessStateChangedPayload = {
  state: ReturnType<BusinessState["toJSON"]>;
};
export type BusinessStateChangedEvent = DomainEvent<BusinessStateChangedPayload>;

export function createBusinessStateChangedEvent(
  state: BusinessState,
): BusinessStateChangedEvent {
  return createDomainEvent({
    eventType: "BusinessStateChanged",
    aggregateId: state.id,
    organizationId: state.organizationId,
    payload: { state: state.toJSON() },
  });
}
