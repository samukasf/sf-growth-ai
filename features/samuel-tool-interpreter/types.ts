import type { IntentClassificationResult } from "@/features/samuel-intent-router";

/**
 * Entrada do Tool Result Interpreter (Sprint 87 — AI Tool Interpretation Layer).
 * Transforma o output bruto de qualquer Tool em contexto textual para o AI
 * Gateway — o Samuel nunca deve expor JSON de ferramenta ao usuário final.
 */
export type ToolInterpretationInput = {
  toolName: string;
  /** Ação/query executada — ex.: `inbox_summary`, `count_contacts`. */
  actionId?: string;
  toolInput?: Record<string, unknown>;
  toolOutput: unknown;
  intent: IntentClassificationResult;
  /** Memória da conversa ativa, já renderizada como texto. */
  conversationContext?: string;
  userQuery: string;
};

export type ToolInterpretationResult = {
  /** Kill-switch ativo (`SAMUEL_TOOL_INTERPRETER_ENABLED`). */
  enabled: boolean;
  /** Uma interpretação foi produzida para esta execução. */
  used: boolean;
  toolName?: string;
  actionId?: string;
  /**
   * Bloco textual enviado ao AI Gateway — inclui instruções de resposta
   * natural (via `prompt-builder.ts`).
   */
  contextForAi?: string;
  /**
   * Resumo legível usado quando o AI Gateway não responde — nunca contém
   * JSON bruto.
   */
  humanFallback?: string;
};

export type ToolResultFormatter = (
  input: ToolInterpretationInput,
) => { facts: string; humanFallback: string } | null;
