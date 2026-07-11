import { describe, expect, it } from "vitest";

import { emptyConversationMemorySummary, toConversationMemorySummary } from "./conversation-memory-summary";
import type { ConversationState } from "./types";

describe("toConversationMemorySummary", () => {
  it("achata o ConversationState numa visão pública simples", () => {
    const state: ConversationState = {
      conversationId: "conv-1",
      organizationId: "org-1",
      companyId: "company-1",
      messages: [],
      activeContext: { objective: "Diagnóstico", updatedAt: "t1" },
      entities: [{ value: "SEO", mentionCount: 2, firstMentionedAt: "t0", lastMentionedAt: "t1" }],
      lastIntent: { category: "HYBRID", confidence: 0.8, justification: "j" },
      lastTool: { toolName: "calculator", status: "success", output: { result: 4 } },
      lastResult: { narrativeExcerpt: "Resposta final...", generatedAt: "t1" },
      autoSummary: "resumo",
      turnCount: 3,
      createdAt: "t0",
      updatedAt: "t1",
    };

    expect(toConversationMemorySummary(state)).toEqual({
      conversationId: "conv-1",
      turnCount: 3,
      activeContext: "Diagnóstico",
      entities: ["SEO"],
      lastIntent: "HYBRID",
      lastTool: "calculator (success)",
      lastResult: "Resposta final...",
      autoSummary: "resumo",
    });
  });
});

describe("emptyConversationMemorySummary", () => {
  it("devolve um resumo vazio para uma conversa sem memória", () => {
    expect(emptyConversationMemorySummary("conv-x")).toEqual({
      conversationId: "conv-x",
      turnCount: 0,
      activeContext: null,
      entities: [],
      lastIntent: null,
      lastTool: null,
      lastResult: null,
      autoSummary: null,
    });
  });
});
