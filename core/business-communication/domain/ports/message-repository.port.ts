import type { Attachment, Message } from "../entities";

export interface MessageRepository {
  save(message: Message): Promise<void>;
  findById(id: string): Promise<Message | null>;
  findByConversation(conversationId: string): Promise<Message[]>;
  saveAttachment(attachment: Attachment): Promise<void>;
}
