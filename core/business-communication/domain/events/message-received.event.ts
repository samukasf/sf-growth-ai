import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Message } from "../entities";

export type MessageReceivedPayload = {
  message: ReturnType<Message["toJSON"]>;
};

export type MessageReceivedEvent = DomainEvent<MessageReceivedPayload>;

export function createMessageReceivedEvent(message: Message): MessageReceivedEvent {
  return createDomainEvent({
    eventType: "MessageReceived",
    aggregateId: message.conversationId,
    organizationId: message.organizationId,
    payload: { message: message.toJSON() },
  });
}
