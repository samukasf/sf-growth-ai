import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Conversation } from "../entities";

export type ConversationStartedPayload = {
  conversation: ReturnType<Conversation["toJSON"]>;
};

export type ConversationStartedEvent = DomainEvent<ConversationStartedPayload>;

export function createConversationStartedEvent(
  conversation: Conversation,
): ConversationStartedEvent {
  return createDomainEvent({
    eventType: "ConversationStarted",
    aggregateId: conversation.id,
    organizationId: conversation.organizationId,
    payload: { conversation: conversation.toJSON() },
  });
}
