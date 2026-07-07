import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Invoice } from "../entities";

export type InvoiceIssuedPayload = { invoice: ReturnType<Invoice["toJSON"]> };
export type InvoiceIssuedEvent = DomainEvent<InvoiceIssuedPayload>;

export function createInvoiceIssuedEvent(invoice: Invoice): InvoiceIssuedEvent {
  return createDomainEvent({
    eventType: "InvoiceIssued",
    aggregateId: invoice.id,
    organizationId: invoice.organizationId,
    payload: { invoice: invoice.toJSON() },
  });
}
