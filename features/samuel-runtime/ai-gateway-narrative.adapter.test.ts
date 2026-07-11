import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const executeRequestMock = vi.fn();
const createAIProviderMock = vi.fn(() => ({ executeRequest: executeRequestMock }));

vi.mock("@/core/ai-provider", () => ({
  createAIProvider: createAIProviderMock,
}));

const { generateNarrativeViaAIGateway } = await import("./ai-gateway-narrative.adapter");

const baseInput = {
  organizationId: "org-1",
  companyId: "company-1",
  companyName: "Acme Labs",
  query: "Analise minha empresa",
  priorities: ["Aumentar retenção"],
  risks: ["Queda de tráfego orgânico"],
  opportunities: ["Retargeting pago"],
  councilConsensus: "Conselho unânime: ação em 30 dias.",
  decisionRationale: "Prioridade máxima para recuperação de receita.",
};

function mockSuccessfulExecution(content: string, overrides: Record<string, unknown> = {}) {
  executeRequestMock.mockResolvedValue({
    request: { providerType: "openai", model: "gpt-4o-mini" },
    response: { content, latencyMs: 320 },
    tokenUsage: { promptTokens: 120, completionTokens: 80, estimatedCost: 0.0042 },
    providerId: "openai",
    fallbackUsed: false,
    ...overrides,
  });
}

const ENV_KEYS = ["SAMUEL_AI_GATEWAY_ENABLED", "SAMUEL_AI_GATEWAY_PREFERRED_PROVIDER"] as const;
const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  }
  executeRequestMock.mockReset();
  createAIProviderMock.mockClear();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe("generateNarrativeViaAIGateway", () => {
  it("retorna o conteúdo e a metadata do Gateway quando a chamada é bem-sucedida", async () => {
    mockSuccessfulExecution("  Narrativa gerada pelo AI Gateway.  ");

    const result = await generateNarrativeViaAIGateway(baseInput);

    expect(result?.narrative).toBe("Narrativa gerada pelo AI Gateway.");
    expect(result?.metadata).toEqual({
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
    expect(executeRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        operation: "reason",
        enableFallback: true,
        context: expect.objectContaining({
          companyId: "company-1",
          companyName: "Acme Labs",
          source: "samuel-runtime",
        }),
      }),
    );
  });

  it("retorna null (sem lançar exceção) quando o Gateway falha", async () => {
    executeRequestMock.mockRejectedValue(new Error("no available provider"));

    const result = await generateNarrativeViaAIGateway(baseInput);

    expect(result).toBeNull();
  });

  it("retorna null quando o conteúdo retornado está vazio", async () => {
    mockSuccessfulExecution("   ");

    const result = await generateNarrativeViaAIGateway(baseInput);

    expect(result).toBeNull();
  });

  it("não chama o Gateway quando SAMUEL_AI_GATEWAY_ENABLED=false (kill-switch)", async () => {
    process.env.SAMUEL_AI_GATEWAY_ENABLED = "false";

    const result = await generateNarrativeViaAIGateway(baseInput);

    expect(result).toBeNull();
    expect(createAIProviderMock).not.toHaveBeenCalled();
  });

  it("propaga SAMUEL_AI_GATEWAY_PREFERRED_PROVIDER como preferredType", async () => {
    process.env.SAMUEL_AI_GATEWAY_PREFERRED_PROVIDER = "openai";
    mockSuccessfulExecution("ok");

    await generateNarrativeViaAIGateway(baseInput);

    expect(executeRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ preferredType: "openai" }),
    );
  });

  it("usa 'reason' por padrão quando nenhuma operação é informada", async () => {
    mockSuccessfulExecution("ok");

    await generateNarrativeViaAIGateway(baseInput);

    expect(executeRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "reason" }),
    );
  });

  it("respeita a operação explícita do contexto (ex.: 'summarize')", async () => {
    mockSuccessfulExecution("ok");

    await generateNarrativeViaAIGateway({ ...baseInput, operation: "summarize" });

    expect(executeRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "summarize" }),
    );
  });

  it("modos ainda não suportados pelo Gateway ('plan') caem para 'reason' sem falhar", async () => {
    mockSuccessfulExecution("ok");

    const result = await generateNarrativeViaAIGateway({ ...baseInput, operation: "plan" });

    expect(result?.narrative).toBe("ok");
    expect(executeRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "reason" }),
    );
  });
});
