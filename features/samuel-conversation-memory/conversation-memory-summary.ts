import type { ConversationMemorySummary, ConversationState } from "./types";

/**
 * Achata o `ConversationState` estruturado numa visão pública simples,
 * consumida por `RuntimeResponse.conversationMemory` e pelo Samuel
 * Playground. O estado interno rico permanece só neste módulo.
 */
export function toConversationMemorySummary(state: ConversationState): ConversationMemorySummary {
  return {
    conversationId: state.conversationId,
    turnCount: state.turnCount,
    activeContext: state.activeContext?.objective ?? null,
    entities: state.entities.map((entity) => entity.value),
    lastIntent: state.lastIntent?.category ?? null,
    lastTool: state.lastTool ? `${state.lastTool.toolName} (${state.lastTool.status})` : null,
    lastResult: state.lastResult?.narrativeExcerpt ?? null,
    autoSummary: state.autoSummary,
  };
}

export function emptyConversationMemorySummary(conversationId: string): ConversationMemorySummary {
  return {
    conversationId,
    turnCount: 0,
    activeContext: null,
    entities: [],
    lastIntent: null,
    lastTool: null,
    lastResult: null,
    autoSummary: null,
  };
}
