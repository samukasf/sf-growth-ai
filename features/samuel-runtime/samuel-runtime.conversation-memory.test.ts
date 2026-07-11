import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetConversationMemoryStore } from "@/features/samuel-conversation-memory";

const generateNarrativeViaAIGatewayMock = vi.fn();

vi.mock("./ai-gateway-narrative.adapter", () => ({
  generateNarrativeViaAIGateway: generateNarrativeViaAIGatewayMock,
}));

const { runSamuelRuntime } = await import("./samuel-runtime.service");

let originalKillSwitch: string | undefined;

beforeEach(() => {
  originalKillSwitch = process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  delete process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  resetConversationMemoryStore();
  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue(null);
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  else process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = originalKillSwitch;
  resetConversationMemoryStore();
});

describe("runSamuelRuntime — Conversation Memory (Sprint 81)", () => {
  it("no primeiro turno não há memória prévia — conversationContext é undefined", async () => {
    const result = await runSamuelRuntime({
      query: "Explique SEO",
      conversationId: "conv-1",
      animate: false,
    });

    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({ conversationContext: undefined }),
    );
    expect(result.conversationMemory.conversationId).toBe("conv-1");
    expect(result.conversationMemory.turnCount).toBe(1);
    expect(result.conversationMemory.entities).toContain("SEO");
    expect(result.conversationMemory.lastIntent).toBe(result.intent.category);
    expect(result.pipeline.find((step) => step.id === "conversation_memory")?.status).toBe("complete");
  });

  it("consulta a memória da conversa antes de responder no segundo turno", async () => {
    await runSamuelRuntime({ query: "Explique SEO", conversationId: "conv-2", animate: false });

    const second = await runSamuelRuntime({
      query: "E sobre marketing de conteúdo?",
      conversationId: "conv-2",
      animate: false,
    });

    expect(generateNarrativeViaAIGatewayMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ conversationContext: expect.stringContaining("SEO") }),
    );
    expect(second.conversationMemory.turnCount).toBe(2);
  });

  it("preserva a última ferramenta utilizada mesmo em turnos sem ferramenta", async () => {
    await runSamuelRuntime({ query: "Quanto é 10 + 5?", conversationId: "conv-3", animate: false });

    const second = await runSamuelRuntime({
      query: "Obrigado!",
      conversationId: "conv-3",
      animate: false,
    });

    expect(second.conversationMemory.lastTool).toContain("calculator");
  });

  it("isola a memória entre conversationId diferentes", async () => {
    await runSamuelRuntime({ query: "Explique SEO", conversationId: "conv-A", animate: false });
    await runSamuelRuntime({ query: "Mais sobre SEO", conversationId: "conv-A", animate: false });

    const result = await runSamuelRuntime({
      query: "Analise minha empresa",
      conversationId: "conv-B",
      animate: false,
    });

    expect(result.conversationMemory.turnCount).toBe(1);
  });

  it("desliga leitura/escrita quando SAMUEL_CONVERSATION_MEMORY_ENABLED=false (kill-switch)", async () => {
    await runSamuelRuntime({ query: "Explique SEO", conversationId: "conv-4", animate: false });

    process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = "false";
    const result = await runSamuelRuntime({
      query: "Mais sobre SEO",
      conversationId: "conv-4",
      animate: false,
    });

    expect(result.conversationMemory).toEqual({
      conversationId: "conv-4",
      turnCount: 0,
      activeContext: null,
      entities: [],
      lastIntent: null,
      lastTool: null,
      lastResult: null,
      autoSummary: null,
    });
    expect(generateNarrativeViaAIGatewayMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ conversationContext: undefined }),
    );
  });

  it("usa o fallback organizationId:companyId quando conversationId não é informado", async () => {
    const result = await runSamuelRuntime({
      query: "Explique SEO",
      organizationId: "org-x",
      companyId: "company-y",
      animate: false,
    });

    expect(result.conversationMemory.conversationId).toBe("org-x:company-y");
  });
});
