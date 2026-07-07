import { createDomainEvent, type DomainEvent } from "../../shared";
import type { WaitingList } from "../entities";

export type WaitingListPromotedPayload = {
  entry: ReturnType<WaitingList["toJSON"]>;
};
export type WaitingListPromotedEvent = DomainEvent<WaitingListPromotedPayload>;

export function createWaitingListPromotedEvent(
  entry: WaitingList,
): WaitingListPromotedEvent {
  return createDomainEvent({
    eventType: "WaitingListPromoted",
    aggregateId: entry.id,
    organizationId: entry.organizationId,
    payload: { entry: entry.toJSON() },
  });
}
