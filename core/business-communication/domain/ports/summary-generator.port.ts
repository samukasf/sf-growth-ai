import type { CommunicationSummary, Conversation, Message } from "../entities";

export interface SummaryGenerator {
  generate(conversation: Conversation, messages: Message[]): CommunicationSummary;
}
