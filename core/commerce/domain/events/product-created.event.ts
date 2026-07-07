import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Product } from "../entities";

export type ProductCreatedPayload = { product: ReturnType<Product["toJSON"]> };
export type ProductCreatedEvent = DomainEvent<ProductCreatedPayload>;

export function createProductCreatedEvent(product: Product): ProductCreatedEvent {
  return createDomainEvent({
    eventType: "ProductCreated",
    aggregateId: product.id,
    organizationId: product.organizationId,
    payload: { product: product.toJSON() },
  });
}
