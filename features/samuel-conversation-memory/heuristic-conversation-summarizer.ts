import { extractEntities } from "./entity-extractor";
import type { ConversationSummarizer, SummarizeInput } from "./types";

/**
 * Implementação padrão (determinística, sem IA) de `ConversationSummarizer`.
 * Condensa as mensagens mais antigas num resumo curto, acumulando sobre um
 * `previousSummary` já existente. Pode ser substituída por um summarizer
 * baseado no AI Gateway (modo "summarize") sem alterar o Samuel Runtime —
 * basta injetar outra implementação de `ConversationSummarizer` em
 * `createConversationMemoryStore({ summarizer })`.
 */
export class HeuristicConversationSummarizer implements ConversationSummarizer {
  summarize({ previousSummary, messagesToCompress }: SummarizeInput): string {
    const userTurns = messagesToCompress.filter((message) => message.role === "user");
    const topics = Array.from(
      new Set(userTurns.flatMap((message) => extractEntities(message.content))),
    ).slice(0, 5);

    const topicsPart = topics.length > 0 ? ` sobre ${topics.join(", ")}` : "";
    const newFragment = `Resumo automático de ${userTurns.length} pergunta(s) anteriores${topicsPart}.`;

    return previousSummary ? `${previousSummary} ${newFragment}` : newFragment;
  }
}
