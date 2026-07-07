import { createDomainEvent, type DomainEvent } from "../../shared";
import type { PurchaseRequest } from "../entities";

export type PurchaseApprovedPayload = {
  purchaseRequest: ReturnType<PurchaseRequest["toJSON"]>;
  approverId: string;
};
export type PurchaseApprovedEvent = DomainEvent<PurchaseApprovedPayload>;

export function createPurchaseApprovedEvent(
  purchaseRequest: PurchaseRequest,
  approverId: string,
): PurchaseApprovedEvent {
  return createDomainEvent({
    eventType: "PurchaseApproved",
    aggregateId: purchaseRequest.id,
    organizationId: purchaseRequest.organizationId,
    payload: { purchaseRequest: purchaseRequest.toJSON(), approverId },
  });
}
