import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveRequest } from "../entities";

export type ExecutiveRequestReceivedPayload = {
  request: ReturnType<ExecutiveRequest["toJSON"]>;
};

export type ExecutiveRequestReceivedEvent = DomainEvent<ExecutiveRequestReceivedPayload>;

export function createExecutiveRequestReceivedEvent(
  request: ExecutiveRequest,
): ExecutiveRequestReceivedEvent {
  return createDomainEvent({
    eventType: "ExecutiveRequestReceived",
    aggregateId: request.id,
    companyId: request.companyId,
    payload: { request: request.toJSON() },
  });
}
