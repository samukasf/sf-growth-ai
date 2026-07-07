import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Customer } from "../entities";

export type CustomerLostPayload = {
  customer: ReturnType<Customer["toJSON"]>;
  reason: string;
};
export type CustomerLostEvent = DomainEvent<CustomerLostPayload>;

export function createCustomerLostEvent(customer: Customer, reason: string): CustomerLostEvent {
  return createDomainEvent({
    eventType: "CustomerLost",
    aggregateId: customer.id,
    organizationId: customer.organizationId,
    payload: { customer: customer.toJSON(), reason },
  });
}
