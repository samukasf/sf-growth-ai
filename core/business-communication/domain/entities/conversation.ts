import type {
  CommunicationChannelId,
  ConversationId,
  OrganizationId,
  ParticipantId,
} from "../../shared";

export type ConversationStatus = "open" | "pending" | "closed" | "archived";

export type ConversationProps = {
  id: ConversationId;
  organizationId: OrganizationId;
  channelId: CommunicationChannelId;
  subject: string;
  status: ConversationStatus;
  participantIds: ParticipantId[];
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
};

export class Conversation {
  readonly id: ConversationId;
  readonly organizationId: OrganizationId;
  readonly channelId: CommunicationChannelId;
  readonly subject: string;
  readonly status: ConversationStatus;
  readonly participantIds: ParticipantId[];
  readonly messageCount: number;
  readonly lastMessageAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly closedAt?: string;

  private constructor(props: ConversationProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.channelId = props.channelId;
    this.subject = props.subject;
    this.status = props.status;
    this.participantIds = [...props.participantIds];
    this.messageCount = props.messageCount;
    this.lastMessageAt = props.lastMessageAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.closedAt = props.closedAt;
  }

  static create(
    props: Omit<ConversationProps, "id" | "createdAt" | "updatedAt" | "status" | "messageCount"> & {
      id?: ConversationId;
      createdAt?: string;
      updatedAt?: string;
      status?: ConversationStatus;
      messageCount?: number;
    },
  ): Conversation {
    const now = new Date().toISOString();
    return new Conversation({
      id: props.id ?? `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      channelId: props.channelId,
      subject: props.subject.trim(),
      status: props.status ?? "open",
      participantIds: props.participantIds,
      messageCount: props.messageCount ?? 0,
      lastMessageAt: props.lastMessageAt,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      closedAt: props.closedAt,
    });
  }

  close(): Conversation {
    return Conversation.create({
      ...this.toJSON(),
      status: "closed",
      updatedAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
    });
  }

  withMessage(): Conversation {
    return Conversation.create({
      ...this.toJSON(),
      messageCount: this.messageCount + 1,
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ConversationProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      channelId: this.channelId,
      subject: this.subject,
      status: this.status,
      participantIds: [...this.participantIds],
      messageCount: this.messageCount,
      lastMessageAt: this.lastMessageAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      closedAt: this.closedAt,
    };
  }
}
