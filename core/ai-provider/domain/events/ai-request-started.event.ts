import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AIRequest } from "../entities";

export type AIRequestStartedPayload = { request: ReturnType<AIRequest["toJSON"]> };
export type AIRequestStartedEvent = DomainEvent<AIRequestStartedPayload>;

export function createAIRequestStartedEvent(request: AIRequest): AIRequestStartedEvent {
  return createDomainEvent({
    eventType: "AIRequestStarted",
    aggregateId: request.id,
    organizationId: request.organizationId,
    payload: { request: request.toJSON() },
  });
}
