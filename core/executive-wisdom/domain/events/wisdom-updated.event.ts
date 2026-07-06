import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveWisdom } from "../entities";

export type WisdomUpdatedPayload = {
  wisdom: ReturnType<ExecutiveWisdom["toJSON"]>;
  changedFields: string[];
};

export type WisdomUpdatedEvent = DomainEvent<WisdomUpdatedPayload>;

export function createWisdomUpdatedEvent(
  wisdom: ExecutiveWisdom,
  changedFields: string[],
): WisdomUpdatedEvent {
  return createDomainEvent({
    eventType: "WisdomUpdated",
    aggregateId: wisdom.id,
    companyId: wisdom.companyId,
    payload: { wisdom: wisdom.toJSON(), changedFields },
  });
}
