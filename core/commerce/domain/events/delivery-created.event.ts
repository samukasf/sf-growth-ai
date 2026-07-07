import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Delivery } from "../entities";

export type DeliveryCreatedPayload = { delivery: ReturnType<Delivery["toJSON"]> };
export type DeliveryCreatedEvent = DomainEvent<DeliveryCreatedPayload>;

export function createDeliveryCreatedEvent(delivery: Delivery): DeliveryCreatedEvent {
  return createDomainEvent({
    eventType: "DeliveryCreated",
    aggregateId: delivery.id,
    organizationId: delivery.organizationId,
    payload: { delivery: delivery.toJSON() },
  });
}
