import type { ConversationState } from "./types";

/** Quantidade de mensagens brutas mais recentes incluídas no prompt do AI Gateway. */
const RECENT_MESSAGES_IN_PROMPT = 4;

/**
 * Renderiza o `ConversationState` como texto legível para ser injetado no
 * prompt do AI Gateway (ver `ai-gateway-narrative.adapter.ts`) — é assim
 * que o Samuel efetivamente "consulta" a memória antes de responder.
 * Devolve `null` quando não há nada relevante para incluir (conversa nova).
 */
export function renderConversationContext(state: ConversationState): string | null {
  const parts: string[] = [];

  if (state.autoSummary) {
    parts.push(`Resumo da conversa até agora: ${state.autoSummary}`);
  }

  const recentMessages = state.messages.slice(-RECENT_MESSAGES_IN_PROMPT);
  if (recentMessages.length > 0) {
    const rendered = recentMessages
      .map((message) => `${message.role === "user" ? "Usuário" : "Samuel"}: ${message.content}`)
      .join(" | ");
    parts.push(`Últimas mensagens desta conversa: ${rendered}`);
  }

  if (state.entities.length > 0) {
    parts.push(
      `Entidades mencionadas anteriormente: ${state.entities.map((entity) => entity.value).join(", ")}`,
    );
  }

  if (state.lastIntent) {
    parts.push(`Última intenção identificada: ${state.lastIntent.category}`);
  }

  if (state.lastTool) {
    parts.push(
      `Última ferramenta utilizada: ${state.lastTool.toolName} (${state.lastTool.status})`,
    );
  }

  return parts.length > 0 ? parts.join("\n") : null;
}
