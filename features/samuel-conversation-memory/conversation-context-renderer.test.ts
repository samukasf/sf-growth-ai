import { describe, expect, it } from "vitest";

import { renderConversationContext } from "./conversation-context-renderer";
import type { ConversationState } from "./types";

function buildState(overrides: Partial<ConversationState> = {}): ConversationState {
  return {
    conversationId: "conv-1",
    organizationId: "org-1",
    companyId: "company-1",
    messages: [],
    activeContext: null,
    entities: [],
    lastIntent: null,
    lastTool: null,
    lastResult: null,
    autoSummary: null,
    turnCount: 0,
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
    ...overrides,
  };
}

describe("renderConversationContext", () => {
  it("devolve null quando não há nada relevante (conversa nova)", () => {
    expect(renderConversationContext(buildState())).toBeNull();
  });

  it("inclui o resumo automático quando existir", () => {
    const context = renderConversationContext(buildState({ autoSummary: "Resumo X" }));
    expect(context).toContain("Resumo X");
  });

  it("inclui as mensagens recentes, entidades, última intenção e última ferramenta", () => {
    const context = renderConversationContext(
      buildState({
        messages: [
          { role: "user", content: "Explique SEO", timestamp: "t1" },
          { role: "assistant", content: "SEO é...", timestamp: "t1" },
        ],
        entities: [{ value: "SEO", mentionCount: 1, firstMentionedAt: "t1", lastMentionedAt: "t1" }],
        lastIntent: { category: "HYBRID", confidence: 0.8, justification: "j" },
        lastTool: { toolName: "calculator", status: "success" },
      }),
    );

    expect(context).toContain("Explique SEO");
    expect(context).toContain("SEO é...");
    expect(context).toContain("SEO");
    expect(context).toContain("HYBRID");
    expect(context).toContain("calculator");
  });
});
