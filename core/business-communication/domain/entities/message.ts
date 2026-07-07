import type {
  AttachmentId,
  ConversationId,
  MessageId,
  OrganizationId,
  ParticipantId,
} from "../../shared";

export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "received" | "sent" | "delivered" | "read" | "failed";

export type MessageProps = {
  id: MessageId;
  organizationId: OrganizationId;
  conversationId: ConversationId;
  senderId: ParticipantId;
  direction: MessageDirection;
  content: string;
  status: MessageStatus;
  classification?: string;
  attachmentIds: AttachmentId[];
  createdAt: string;
};

export class Message {
  readonly id: MessageId;
  readonly organizationId: OrganizationId;
  readonly conversationId: ConversationId;
  readonly senderId: ParticipantId;
  readonly direction: MessageDirection;
  readonly content: string;
  readonly status: MessageStatus;
  readonly classification?: string;
  readonly attachmentIds: AttachmentId[];
  readonly createdAt: string;

  private constructor(props: MessageProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.direction = props.direction;
    this.content = props.content;
    this.status = props.status;
    this.classification = props.classification;
    this.attachmentIds = [...props.attachmentIds];
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<MessageProps, "id" | "createdAt" | "status"> & {
      id?: MessageId;
      createdAt?: string;
      status?: MessageStatus;
    },
  ): Message {
    if (!props.content.trim()) throw new Error("content is required");

    return new Message({
      id: props.id ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      conversationId: props.conversationId,
      senderId: props.senderId,
      direction: props.direction,
      content: props.content.trim(),
      status: props.status ?? (props.direction === "inbound" ? "received" : "sent"),
      classification: props.classification,
      attachmentIds: props.attachmentIds,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  withClassification(classification: string): Message {
    return Message.create({ ...this.toJSON(), classification });
  }

  toJSON(): MessageProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      conversationId: this.conversationId,
      senderId: this.senderId,
      direction: this.direction,
      content: this.content,
      status: this.status,
      classification: this.classification,
      attachmentIds: [...this.attachmentIds],
      createdAt: this.createdAt,
    };
  }
}
