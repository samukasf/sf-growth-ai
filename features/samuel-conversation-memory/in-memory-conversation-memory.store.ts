import { extractEntities } from "./entity-extractor";
import { HeuristicConversationSummarizer } from "./heuristic-conversation-summarizer";
import type {
  ConversationEntity,
  ConversationMemoryStore,
  ConversationMessage,
  ConversationState,
  ConversationSummarizer,
  RecordTurnInput,
} from "./types";

/** Quantidade de mensagens brutas a partir da qual o histórico mais antigo é resumido. */
const MAX_RAW_MESSAGES = 12;
/** Quantidade de mensagens brutas mantidas (mais recentes) após o resumo. */
const KEEP_RAW_MESSAGES = 6;

function mergeEntities(
  existing: ConversationEntity[],
  newValues: string[],
  now: string,
): ConversationEntity[] {
  const byValue = new Map(existing.map((entity) => [entity.value, entity]));

  for (const value of newValues) {
    const current = byValue.get(value);
    if (current) {
      byValue.set(value, { ...current, mentionCount: current.mentionCount + 1, lastMentionedAt: now });
    } else {
      byValue.set(value, { value, mentionCount: 1, firstMentionedAt: now, lastMentionedAt: now });
    }
  }

  return Array.from(byValue.values());
}

/**
 * Implementação padrão do `ConversationMemoryStore` — guarda o estado da
 * conversa em memória do processo (`Map`), não em um banco de dados.
 * Isso é intencional nesta sprint: "memória da conversa ativa", não
 * memória permanente. Trocar por uma implementação persistente (Redis,
 * Supabase) no futuro não exige alterar o Samuel Runtime — basta uma nova
 * classe implementando `ConversationMemoryStore`.
 */
export class InMemoryConversationMemoryStore implements ConversationMemoryStore {
  private readonly states = new Map<string, ConversationState>();
  private readonly summarizer: ConversationSummarizer;

  constructor(summarizer: ConversationSummarizer = new HeuristicConversationSummarizer()) {
    this.summarizer = summarizer;
  }

  get(conversationId: string): ConversationState | null {
    return this.states.get(conversationId) ?? null;
  }

  recordTurn(input: RecordTurnInput): ConversationState {
    const now = input.timestamp ?? new Date().toISOString();
    const existing = this.states.get(input.conversationId) ?? null;

    let messages: ConversationMessage[] = [
      ...(existing?.messages ?? []),
      { role: "user", content: input.userMessage, timestamp: now },
      { role: "assistant", content: input.assistantMessage, timestamp: now },
    ];

    let autoSummary = existing?.autoSummary ?? null;
    if (messages.length > MAX_RAW_MESSAGES) {
      const messagesToCompress = messages.slice(0, messages.length - KEEP_RAW_MESSAGES);
      messages = messages.slice(messages.length - KEEP_RAW_MESSAGES);
      autoSummary = this.summarizer.summarize({
        conversationId: input.conversationId,
        previousSummary: autoSummary,
        messagesToCompress,
      });
    }

    const entities = mergeEntities(
      existing?.entities ?? [],
      extractEntities(input.userMessage),
      now,
    );

    const state: ConversationState = {
      conversationId: input.conversationId,
      organizationId: input.organizationId,
      companyId: input.companyId,
      messages,
      activeContext: input.activeContextObjective
        ? { objective: input.activeContextObjective, updatedAt: now }
        : existing?.activeContext ?? null,
      entities,
      lastIntent: input.intent ?? existing?.lastIntent ?? null,
      lastTool: input.tool ?? existing?.lastTool ?? null,
      lastResult: {
        narrativeExcerpt: input.assistantMessage.slice(0, 160),
        generatedAt: now,
      },
      autoSummary,
      turnCount: (existing?.turnCount ?? 0) + 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.states.set(input.conversationId, state);
    return state;
  }
}

export type CreateConversationMemoryStoreOptions = {
  /** Summarizer a injetar. Default: `HeuristicConversationSummarizer` (determinístico, sem IA). */
  summarizer?: ConversationSummarizer;
};

export function createConversationMemoryStore(
  options: CreateConversationMemoryStoreOptions = {},
): ConversationMemoryStore {
  return new InMemoryConversationMemoryStore(options.summarizer);
}

let singleton: ConversationMemoryStore | null = null;

/**
 * Instância única por processo — necessária para que a memória
 * efetivamente persista entre chamadas da mesma conversa (diferente do
 * Tool Orchestrator, que é intencionalmente sem estado).
 */
export function getConversationMemoryStore(): ConversationMemoryStore {
  if (!singleton) {
    singleton = createConversationMemoryStore();
  }
  return singleton;
}

/** Utilitário de teste — garante isolamento entre casos de teste que usam o singleton. */
export function resetConversationMemoryStore(): void {
  singleton = null;
}
