import { createDomainEvent, type DomainEvent } from "../../shared";
import type { PurchaseRequest } from "../entities";

export type PurchaseRequestedPayload = {
  purchaseRequest: ReturnType<PurchaseRequest["toJSON"]>;
};
export type PurchaseRequestedEvent = DomainEvent<PurchaseRequestedPayload>;

export function createPurchaseRequestedEvent(
  purchaseRequest: PurchaseRequest,
): PurchaseRequestedEvent {
  return createDomainEvent({
    eventType: "PurchaseRequested",
    aggregateId: purchaseRequest.id,
    organizationId: purchaseRequest.organizationId,
    payload: { purchaseRequest: purchaseRequest.toJSON() },
  });
}
