import { createDomainEvent, type DomainEvent } from "../../shared";

export type AutoReplyApprovedPayload = {
  conversationId: string;
  messageId: string;
  approvedReply: string;
  approverId: string;
  approvedAt: string;
};

export type AutoReplyApprovedEvent = DomainEvent<AutoReplyApprovedPayload>;

export function createAutoReplyApprovedEvent(input: {
  organizationId: string;
  conversationId: string;
  messageId: string;
  approvedReply: string;
  approverId: string;
}): AutoReplyApprovedEvent {
  return createDomainEvent({
    eventType: "AutoReplyApproved",
    aggregateId: input.conversationId,
    organizationId: input.organizationId,
    payload: {
      conversationId: input.conversationId,
      messageId: input.messageId,
      approvedReply: input.approvedReply,
      approverId: input.approverId,
      approvedAt: new Date().toISOString(),
    },
  });
}
