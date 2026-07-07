import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Customer } from "../entities";

export type CustomerCreatedPayload = { customer: ReturnType<Customer["toJSON"]> };
export type CustomerCreatedEvent = DomainEvent<CustomerCreatedPayload>;

export function createCustomerCreatedEvent(customer: Customer): CustomerCreatedEvent {
  return createDomainEvent({
    eventType: "CustomerCreated",
    aggregateId: customer.id,
    organizationId: customer.organizationId,
    payload: { customer: customer.toJSON() },
  });
}
