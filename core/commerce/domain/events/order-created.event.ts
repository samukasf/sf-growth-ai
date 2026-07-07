import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Order } from "../entities";

export type OrderCreatedPayload = { order: ReturnType<Order["toJSON"]> };
export type OrderCreatedEvent = DomainEvent<OrderCreatedPayload>;

export function createOrderCreatedEvent(order: Order): OrderCreatedEvent {
  return createDomainEvent({
    eventType: "OrderCreated",
    aggregateId: order.id,
    organizationId: order.organizationId,
    payload: { order: order.toJSON() },
  });
}
