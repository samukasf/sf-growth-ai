import { describe, expect, it } from "vitest";

import {
  createConversationMemoryStore,
  getConversationMemoryStore,
  InMemoryConversationMemoryStore,
  resetConversationMemoryStore,
} from "./in-memory-conversation-memory.store";
import type { ConversationSummarizer } from "./types";

describe("InMemoryConversationMemoryStore", () => {
  it("devolve null para uma conversa desconhecida", () => {
    const store = new InMemoryConversationMemoryStore();
    expect(store.get("desconhecida")).toBeNull();
  });

  it("cria e acumula o estado da conversa a cada turno", () => {
    const store = new InMemoryConversationMemoryStore();

    const first = store.recordTurn({
      conversationId: "conv-1",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "Explique SEO",
      assistantMessage: "SEO é...",
      activeContextObjective: "Aprender sobre SEO",
      intent: { category: "HYBRID", confidence: 0.8, justification: "j1" },
    });

    expect(first.turnCount).toBe(1);
    expect(first.messages).toHaveLength(2);
    expect(first.activeContext).toEqual({ objective: "Aprender sobre SEO", updatedAt: first.updatedAt });

    const second = store.recordTurn({
      conversationId: "conv-1",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "E sobre marketing?",
      assistantMessage: "Marketing é...",
      intent: { category: "BUSINESS", confidence: 0.7, justification: "j2" },
    });

    expect(second.turnCount).toBe(2);
    expect(second.messages).toHaveLength(4);
    // activeContext sem novo objective é preservado do turno anterior.
    expect(second.activeContext?.objective).toBe("Aprender sobre SEO");
    expect(store.get("conv-1")).toEqual(second);
  });

  it("preserva o lastTool anterior quando o turno atual não usa nenhuma ferramenta", () => {
    const store = new InMemoryConversationMemoryStore();

    store.recordTurn({
      conversationId: "conv-1",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "Quanto é 2 + 2?",
      assistantMessage: "4",
      tool: { toolName: "calculator", status: "success", output: { result: 4 } },
    });

    const second = store.recordTurn({
      conversationId: "conv-1",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "Obrigado!",
      assistantMessage: "De nada!",
      tool: null,
    });

    expect(second.lastTool).toEqual({ toolName: "calculator", status: "success", output: { result: 4 } });
  });

  it("acumula entidades e incrementa mentionCount em menções repetidas", () => {
    const store = new InMemoryConversationMemoryStore();

    store.recordTurn({
      conversationId: "conv-1",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "Explique SEO",
      assistantMessage: "ok",
    });

    const second = store.recordTurn({
      conversationId: "conv-1",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "Mais sobre SEO, por favor",
      assistantMessage: "ok",
    });

    const seoEntity = second.entities.find((entity) => entity.value === "SEO");
    expect(seoEntity?.mentionCount).toBe(2);
  });

  it("resume mensagens antigas quando o histórico cresce além do limite", () => {
    const summarizeMock: ConversationSummarizer = {
      summarize: () => "resumo-mockado",
    };
    const store = new InMemoryConversationMemoryStore(summarizeMock);

    let state = null;
    for (let i = 0; i < 7; i++) {
      state = store.recordTurn({
        conversationId: "conv-1",
        organizationId: "org-1",
        companyId: "company-1",
        userMessage: `pergunta ${i}`,
        assistantMessage: `resposta ${i}`,
      });
    }

    expect(state?.autoSummary).toBe("resumo-mockado");
    expect(state?.messages.length).toBeLessThanOrEqual(6);
  });

  it("isola estados entre conversationId diferentes", () => {
    const store = new InMemoryConversationMemoryStore();

    store.recordTurn({
      conversationId: "conv-A",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "pergunta A",
      assistantMessage: "resposta A",
    });

    expect(store.get("conv-B")).toBeNull();
  });
});

describe("getConversationMemoryStore (singleton)", () => {
  it("devolve a mesma instância entre chamadas, persistindo o estado", () => {
    resetConversationMemoryStore();

    getConversationMemoryStore().recordTurn({
      conversationId: "conv-singleton",
      organizationId: "org-1",
      companyId: "company-1",
      userMessage: "oi",
      assistantMessage: "olá",
    });

    expect(getConversationMemoryStore().get("conv-singleton")?.turnCount).toBe(1);
    resetConversationMemoryStore();
  });
});

describe("createConversationMemoryStore", () => {
  it("aceita um summarizer customizado (substituível sem alterar consumidores)", () => {
    const customSummarizer: ConversationSummarizer = {
      summarize: () => "resumo customizado",
    };
    const store = createConversationMemoryStore({ summarizer: customSummarizer }) as InMemoryConversationMemoryStore;

    let state = null;
    for (let i = 0; i < 7; i++) {
      state = store.recordTurn({
        conversationId: "conv-1",
        organizationId: "org-1",
        companyId: "company-1",
        userMessage: `pergunta ${i}`,
        assistantMessage: `resposta ${i}`,
      });
    }

    expect(state?.autoSummary).toBe("resumo customizado");
  });
});
