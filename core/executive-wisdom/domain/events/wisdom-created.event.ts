import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveWisdom } from "../entities";

export type WisdomCreatedPayload = {
  wisdom: ReturnType<ExecutiveWisdom["toJSON"]>;
};

export type WisdomCreatedEvent = DomainEvent<WisdomCreatedPayload>;

export function createWisdomCreatedEvent(wisdom: ExecutiveWisdom): WisdomCreatedEvent {
  return createDomainEvent({
    eventType: "WisdomCreated",
    aggregateId: wisdom.id,
    companyId: wisdom.companyId,
    payload: { wisdom: wisdom.toJSON() },
  });
}
