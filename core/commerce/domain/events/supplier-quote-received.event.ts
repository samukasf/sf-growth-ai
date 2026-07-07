import { createDomainEvent, type DomainEvent } from "../../shared";
import type { SupplierQuote } from "../entities";

export type SupplierQuoteReceivedPayload = {
  quote: ReturnType<SupplierQuote["toJSON"]>;
};
export type SupplierQuoteReceivedEvent = DomainEvent<SupplierQuoteReceivedPayload>;

export function createSupplierQuoteReceivedEvent(
  quote: SupplierQuote,
): SupplierQuoteReceivedEvent {
  return createDomainEvent({
    eventType: "SupplierQuoteReceived",
    aggregateId: quote.id,
    organizationId: quote.organizationId,
    payload: { quote: quote.toJSON() },
  });
}
