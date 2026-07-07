import { Attachment, Message, type MessageRepository } from "../../domain";

function serializeMessage(msg: Message): string {
  return JSON.stringify(msg.toJSON());
}

function deserializeMessage(raw: string): Message {
  return Message.create(JSON.parse(raw) as ReturnType<Message["toJSON"]>);
}

export class InMemoryMessageRepository implements MessageRepository {
  private readonly messages = new Map<string, string>();
  private readonly attachments: Attachment[] = [];

  async save(message: Message): Promise<void> {
    this.messages.set(message.id, serializeMessage(message));
  }

  async findById(id: string): Promise<Message | null> {
    const raw = this.messages.get(id);
    return raw ? deserializeMessage(raw) : null;
  }

  async findByConversation(conversationId: string): Promise<Message[]> {
    const results: Message[] = [];
    for (const raw of this.messages.values()) {
      const msg = deserializeMessage(raw);
      if (msg.conversationId === conversationId) results.push(msg);
    }
    return results.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  async saveAttachment(attachment: Attachment): Promise<void> {
    this.attachments.push(attachment);
  }
}
