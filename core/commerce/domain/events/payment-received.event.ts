import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Payment } from "../entities";

export type PaymentReceivedPayload = { payment: ReturnType<Payment["toJSON"]> };
export type PaymentReceivedEvent = DomainEvent<PaymentReceivedPayload>;

export function createPaymentReceivedEvent(payment: Payment): PaymentReceivedEvent {
  return createDomainEvent({
    eventType: "PaymentReceived",
    aggregateId: payment.id,
    organizationId: payment.organizationId,
    payload: { payment: payment.toJSON() },
  });
}
