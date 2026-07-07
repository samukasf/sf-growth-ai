import {
  CommunicationSummary,
  Conversation,
  type ConversationRepository,
} from "../../domain";

function serializeConversation(conv: Conversation): string {
  return JSON.stringify(conv.toJSON());
}

function deserializeConversation(raw: string): Conversation {
  return Conversation.create(JSON.parse(raw) as ReturnType<Conversation["toJSON"]>);
}

export class InMemoryConversationRepository implements ConversationRepository {
  private readonly conversations = new Map<string, string>();
  private readonly summaries: CommunicationSummary[] = [];

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, serializeConversation(conversation));
  }

  async findById(id: string): Promise<Conversation | null> {
    const raw = this.conversations.get(id);
    return raw ? deserializeConversation(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Conversation[]> {
    const results: Conversation[] = [];
    for (const raw of this.conversations.values()) {
      const conv = deserializeConversation(raw);
      if (conv.organizationId === organizationId) results.push(conv);
    }
    return results;
  }

  async saveSummary(summary: CommunicationSummary): Promise<void> {
    this.summaries.push(summary);
  }
}
