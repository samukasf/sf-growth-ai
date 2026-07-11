/**
 * Samuel Conversation Memory (Sprint 81).
 *
 * Memória da conversa ATIVA — não é memória permanente do usuário. Guardada
 * em processo (ver `InMemoryConversationMemoryStore`), com um estado
 * estruturado (`ConversationState`) por `conversationId`, não apenas um
 * histórico textual solto.
 */

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type ConversationEntity = {
  value: string;
  mentionCount: number;
  firstMentionedAt: string;
  lastMentionedAt: string;
};

export type ConversationActiveContext = {
  objective: string;
  updatedAt: string;
};

export type ConversationLastIntent = {
  category: string;
  confidence: number;
  justification: string;
};

export type ConversationLastTool = {
  toolName: string;
  status: "success" | "error";
  output?: unknown;
  error?: string;
};

export type ConversationLastResult = {
  narrativeExcerpt: string;
  generatedAt: string;
};

/** Estado estruturado de uma conversa — a unidade de leitura/escrita da memória. */
export type ConversationState = {
  conversationId: string;
  organizationId: string;
  companyId: string;
  messages: ConversationMessage[];
  activeContext: ConversationActiveContext | null;
  entities: ConversationEntity[];
  lastIntent: ConversationLastIntent | null;
  lastTool: ConversationLastTool | null;
  lastResult: ConversationLastResult | null;
  autoSummary: string | null;
  turnCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RecordTurnInput = {
  conversationId: string;
  organizationId: string;
  companyId: string;
  userMessage: string;
  assistantMessage: string;
  /** Objetivo detectado nesta interação. `undefined`/vazio mantém o `activeContext` anterior. */
  activeContextObjective?: string | null;
  intent?: ConversationLastIntent | null;
  /**
   * Ferramenta usada nesta interação. `null` explícito significa "nenhuma
   * ferramenta usada nesta interação" — nesse caso o `lastTool` anterior é
   * preservado (não é apagado só porque este turno não usou ferramenta).
   */
  tool?: ConversationLastTool | null;
  timestamp?: string;
};

/** Contrato de persistência da conversa ativa. Trocar a implementação (ex.: Redis, Supabase) nunca exige alterar o Samuel Runtime. */
export interface ConversationMemoryStore {
  get(conversationId: string): ConversationState | null;
  recordTurn(input: RecordTurnInput): ConversationState;
}

export type SummarizeInput = {
  conversationId: string;
  previousSummary: string | null;
  messagesToCompress: ConversationMessage[];
};

/**
 * Contrato de resumo automático. A implementação padrão desta sprint é
 * heurística/determinística (`HeuristicConversationSummarizer`), sem
 * chamar IA. Uma implementação futura baseada no AI Gateway (modo
 * "summarize", já suportado desde a Sprint 71) pode ser injetada em
 * `createConversationMemoryStore({ summarizer })` sem alterar o Samuel
 * Runtime nem o restante deste módulo.
 */
export interface ConversationSummarizer {
  summarize(input: SummarizeInput): string;
}

/**
 * Visão pública/plana da memória, exposta em `RuntimeResponse.conversationMemory`
 * e no Samuel Playground — deriva de `ConversationState` via
 * `toConversationMemorySummary`.
 */
export type ConversationMemorySummary = {
  conversationId: string;
  turnCount: number;
  activeContext: string | null;
  entities: string[];
  lastIntent: string | null;
  lastTool: string | null;
  lastResult: string | null;
  autoSummary: string | null;
};
