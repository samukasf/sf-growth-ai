import type { ChannelType } from "../../domain";

export type ReceiveMessageDto = {
  organizationId: string;
  channelId: string;
  channelType: ChannelType;
  conversationId?: string;
  senderName: string;
  senderIdentifier: string;
  content: string;
  subject?: string;
};

export type SendMessageDto = {
  organizationId: string;
  conversationId: string;
  senderId: string;
  content: string;
};

export type ApproveAutoReplyDto = {
  organizationId: string;
  conversationId: string;
  messageId: string;
  approvedReply: string;
  approverId: string;
};

export type CloseConversationDto = {
  organizationId: string;
  conversationId: string;
};
