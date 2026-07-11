import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generateNarrativeViaAIGatewayMock = vi.fn();

vi.mock("./ai-gateway-narrative.adapter", () => ({
  generateNarrativeViaAIGateway: generateNarrativeViaAIGatewayMock,
}));

const { runSamuelRuntime } = await import("./samuel-runtime.service");

function mockGatewaySuccess(narrative: string, metadataOverrides: Record<string, unknown> = {}) {
  generateNarrativeViaAIGatewayMock.mockResolvedValue({
    narrative,
    metadata: {
      used: true,
      providerId: "openai",
      providerType: "openai",
      model: "gpt-4o-mini",
      operation: "reason",
      promptTokens: 120,
      completionTokens: 80,
      estimatedCostUsd: 0.0042,
      latencyMs: 320,
      fallbackUsed: false,
      ...metadataOverrides,
    },
  });
}

beforeEach(() => {
  generateNarrativeViaAIGatewayMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runSamuelRuntime — integração com AI Gateway", () => {
  it("usa a narrativa e a metadata do AI Gateway quando ele responde com sucesso", async () => {
    mockGatewaySuccess("Narrativa executiva gerada pela IA real via AI Gateway.");

    const result = await runSamuelRuntime({
      query: "Analise minha empresa",
      organizationId: "test-org",
      companyId: "test-company",
      companyName: "Acme Labs",
      animate: false,
    });

    expect(result.response.narrative).toBe(
      "Narrativa executiva gerada pela IA real via AI Gateway.",
    );
    expect(result.aiGateway).toEqual({
      used: true,
      providerId: "openai",
      providerType: "openai",
      model: "gpt-4o-mini",
      operation: "reason",
      promptTokens: 120,
      completionTokens: 80,
      estimatedCostUsd: 0.0042,
      latencyMs: 320,
      fallbackUsed: false,
    });
    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "test-org",
        companyId: "test-company",
        companyName: "Acme Labs",
        query: "Analise minha empresa",
      }),
    );
  });

  it("cai na narrativa heurística e aiGateway.used=false quando o Gateway retorna null (indisponível)", async () => {
    generateNarrativeViaAIGatewayMock.mockResolvedValue(null);

    const result = await runSamuelRuntime({
      query: "Analise minha empresa",
      organizationId: "test-org",
      companyId: "test-company",
      companyName: "Acme Labs",
      animate: false,
    });

    expect(result.response.narrative.length).toBeGreaterThan(0);
    expect(result.response.narrative).not.toBe(
      "Narrativa executiva gerada pela IA real via AI Gateway.",
    );
    expect(result.aiGateway).toEqual({ used: false });
  });

  it("propaga aiGatewayOperation do input até o adapter (configurável por contexto)", async () => {
    mockGatewaySuccess("Resumo executivo via Gateway.", { operation: "summarize" });

    await runSamuelRuntime({
      query: "Resuma minha empresa",
      organizationId: "test-org",
      companyId: "test-company",
      companyName: "Acme Labs",
      animate: false,
      aiGatewayOperation: "summarize",
    });

    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "summarize" }),
    );
  });

  it("preserva o restante do pipeline (fases, decision, council) independente do Gateway", async () => {
    mockGatewaySuccess("Narrativa via Gateway.");

    const result = await runSamuelRuntime({
      query: "Quais são minhas prioridades?",
      organizationId: "test-org",
      companyId: "test-company",
      companyName: "Acme Labs",
      animate: false,
    });

    expect(result.pipeline).toHaveLength(10);
    expect(result.pipeline.every((step) => step.status === "complete")).toBe(true);
    expect(result.companyBrain.status).toBe("active");
    expect(result.executiveCouncil.status).toBe("ready");
    expect(result.decision.title).toBeTruthy();
    expect(result.response.narrative).toBe("Narrativa via Gateway.");
  });
});
