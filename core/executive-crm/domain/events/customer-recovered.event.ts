import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Customer } from "../entities";

export type CustomerRecoveredPayload = {
  customer: ReturnType<Customer["toJSON"]>;
};
export type CustomerRecoveredEvent = DomainEvent<CustomerRecoveredPayload>;

export function createCustomerRecoveredEvent(customer: Customer): CustomerRecoveredEvent {
  return createDomainEvent({
    eventType: "CustomerRecovered",
    aggregateId: customer.id,
    organizationId: customer.organizationId,
    payload: { customer: customer.toJSON() },
  });
}
