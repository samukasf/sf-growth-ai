import { createDomainEvent, type DomainEvent } from "../../shared";

export type AutoReplySuggestedPayload = {
  conversationId: string;
  messageId: string;
  suggestedReply: string;
  autonomyLevel: number;
  requiresApproval: boolean;
};

export type AutoReplySuggestedEvent = DomainEvent<AutoReplySuggestedPayload>;

export function createAutoReplySuggestedEvent(input: {
  organizationId: string;
  conversationId: string;
  messageId: string;
  suggestedReply: string;
  autonomyLevel: number;
  requiresApproval: boolean;
}): AutoReplySuggestedEvent {
  return createDomainEvent({
    eventType: "AutoReplySuggested",
    aggregateId: input.conversationId,
    organizationId: input.organizationId,
    payload: {
      conversationId: input.conversationId,
      messageId: input.messageId,
      suggestedReply: input.suggestedReply,
      autonomyLevel: input.autonomyLevel,
      requiresApproval: input.requiresApproval,
    },
  });
}
