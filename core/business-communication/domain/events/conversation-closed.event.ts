import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Conversation } from "../entities";

export type ConversationClosedPayload = {
  conversation: ReturnType<Conversation["toJSON"]>;
  closedAt: string;
};

export type ConversationClosedEvent = DomainEvent<ConversationClosedPayload>;

export function createConversationClosedEvent(
  conversation: Conversation,
): ConversationClosedEvent {
  return createDomainEvent({
    eventType: "ConversationClosed",
    aggregateId: conversation.id,
    organizationId: conversation.organizationId,
    payload: {
      conversation: conversation.toJSON(),
      closedAt: new Date().toISOString(),
    },
  });
}
