import type { DomainEventId, OrderId, OrganizationId, ProductId } from "../types";

export type DomainEventType =
  | "ProductCreated"
  | "OrderCreated"
  | "PaymentReceived"
  | "InvoiceIssued"
  | "SubscriptionStarted"
  | "PurchaseRequested"
  | "SupplierQuoteReceived"
  | "PurchaseApproved"
  | "DeliveryCreated"
  | "OrderCompleted";

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  eventId: DomainEventId;
  eventType: DomainEventType;
  occurredAt: string;
  aggregateId: string;
  organizationId: OrganizationId;
  payload: TPayload;
};

export function createDomainEvent<TPayload extends Record<string, unknown>>(input: {
  eventType: DomainEventType;
  aggregateId: ProductId | OrderId | string;
  organizationId: OrganizationId;
  payload: TPayload;
}): DomainEvent<TPayload> {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType: input.eventType,
    occurredAt: new Date().toISOString(),
    aggregateId: input.aggregateId,
    organizationId: input.organizationId,
    payload: input.payload,
  };
}
