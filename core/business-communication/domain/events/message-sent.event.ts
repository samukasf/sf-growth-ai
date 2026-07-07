import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Message } from "../entities";

export type MessageSentPayload = {
  message: ReturnType<Message["toJSON"]>;
};

export type MessageSentEvent = DomainEvent<MessageSentPayload>;

export function createMessageSentEvent(message: Message): MessageSentEvent {
  return createDomainEvent({
    eventType: "MessageSent",
    aggregateId: message.conversationId,
    organizationId: message.organizationId,
    payload: { message: message.toJSON() },
  });
}
