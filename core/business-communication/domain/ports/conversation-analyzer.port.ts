import type { Conversation, Message } from "../entities";

export type ConversationAnalysis = {
  topic: string;
  urgency: "low" | "medium" | "high";
  intent: string;
  requiresHuman: boolean;
};

export interface ConversationAnalyzer {
  analyze(conversation: Conversation, messages: Message[]): ConversationAnalysis;
}
