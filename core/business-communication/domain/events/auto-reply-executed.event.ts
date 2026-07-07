import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Message } from "../entities";

export type AutoReplyExecutedPayload = {
  replyMessage: ReturnType<Message["toJSON"]>;
  autonomyLevel: number;
};

export type AutoReplyExecutedEvent = DomainEvent<AutoReplyExecutedPayload>;

export function createAutoReplyExecutedEvent(input: {
  message: Message;
  autonomyLevel: number;
}): AutoReplyExecutedEvent {
  return createDomainEvent({
    eventType: "AutoReplyExecuted",
    aggregateId: input.message.conversationId,
    organizationId: input.message.organizationId,
    payload: {
      replyMessage: input.message.toJSON(),
      autonomyLevel: input.autonomyLevel,
    },
  });
}
