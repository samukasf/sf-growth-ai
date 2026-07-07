import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Order } from "../entities";

export type OrderCompletedPayload = { order: ReturnType<Order["toJSON"]> };
export type OrderCompletedEvent = DomainEvent<OrderCompletedPayload>;

export function createOrderCompletedEvent(order: Order): OrderCompletedEvent {
  return createDomainEvent({
    eventType: "OrderCompleted",
    aggregateId: order.id,
    organizationId: order.organizationId,
    payload: { order: order.toJSON() },
  });
}
