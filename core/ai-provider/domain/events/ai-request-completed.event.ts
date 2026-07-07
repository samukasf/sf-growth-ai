import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AIRequest, AIResponse } from "../entities";

export type AIRequestCompletedPayload = {
  request: ReturnType<AIRequest["toJSON"]>;
  response: ReturnType<AIResponse["toJSON"]>;
};
export type AIRequestCompletedEvent = DomainEvent<AIRequestCompletedPayload>;

export function createAIRequestCompletedEvent(
  request: AIRequest,
  response: AIResponse,
): AIRequestCompletedEvent {
  return createDomainEvent({
    eventType: "AIRequestCompleted",
    aggregateId: request.id,
    organizationId: request.organizationId,
    payload: { request: request.toJSON(), response: response.toJSON() },
  });
}
