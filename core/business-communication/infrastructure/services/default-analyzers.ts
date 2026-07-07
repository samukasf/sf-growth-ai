import {
  CommunicationSummary,
  type Conversation,
  type ConversationAnalysis,
  type ConversationAnalyzer,
  type Message,
  type MessageClassification,
  type MessageClassifier,
  type SummaryGenerator,
} from "../../domain";

export class DefaultConversationAnalyzer implements ConversationAnalyzer {
  analyze(conversation: Conversation, messages: Message[]): ConversationAnalysis {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content.toLowerCase() ?? "";

    const urgency =
      content.includes("urgente") || content.includes("urgent")
        ? "high"
        : content.includes("?")
          ? "medium"
          : "low";

    return {
      topic: conversation.subject,
      urgency,
      intent: content.includes("preço") || content.includes("price") ? "pricing" : "general",
      requiresHuman: urgency === "high",
    };
  }
}

export class DefaultMessageClassifier implements MessageClassifier {
  classify(message: Message): MessageClassification {
    const content = message.content.toLowerCase();
    const isSimpleQuestion =
      content.includes("?") &&
      (content.includes("horário") ||
        content.includes("preço") ||
        content.includes("onde") ||
        content.length < 100);

    return {
      category: isSimpleQuestion ? "simple_question" : "general",
      intent: content.includes("comprar") ? "purchase" : "inquiry",
      confidence: isSimpleQuestion ? 85 : 60,
      isSimpleQuestion,
    };
  }
}

export class DefaultSummaryGenerator implements SummaryGenerator {
  generate(conversation: Conversation, messages: Message[]): CommunicationSummary {
    const inbound = messages.filter((m) => m.direction === "inbound").length;
    const outbound = messages.filter((m) => m.direction === "outbound").length;

    return CommunicationSummary.create({
      organizationId: conversation.organizationId,
      conversationId: conversation.id,
      summary: `Conversa com ${messages.length} mensagens (${inbound} recebidas, ${outbound} enviadas).`,
      keyPoints: [`Assunto: ${conversation.subject}`, `Status: ${conversation.status}`],
      sentiment: "neutral",
      actionItems: conversation.status === "open" ? ["Responder cliente"] : [],
    });
  }
}
