import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const executeRequestMock = vi.fn();
const createAIProviderMock = vi.fn(() => ({ executeRequest: executeRequestMock }));

vi.mock("@/core/ai-provider", () => ({
  createAIProvider: createAIProviderMock,
}));

const { createAISpecialists } = await import("./ai-council-specialist.adapter");

function mockSuccessfulExecution(structuredOutput: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  executeRequestMock.mockResolvedValue({
    request: { providerType: "openai", model: "gpt-4o-mini" },
    response: { content: structuredOutput, structuredOutput, latencyMs: 210 },
    tokenUsage: { promptTokens: 90, completionTokens: 60, estimatedCost: 0.0018 },
    providerId: "openai",
    fallbackUsed: false,
    ...overrides,
  });
}

const baseInput = {
  query: "Devemos investir em uma nova campanha de marketing digital?",
  context: {
    organizationId: "org-1",
    companyId: "company-1",
    companyName: "Acme Labs",
    risks: ["Queda de tráfego orgânico"],
    opportunities: ["Retargeting pago"],
    priorities: ["Aumentar retenção"],
  },
};

const ENV_KEYS = ["EXECUTIVE_COUNCIL_AI_ENABLED", "EXECUTIVE_COUNCIL_AI_PREFERRED_PROVIDER"] as const;
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

describe("createAISpecialists", () => {
  it("cria um especialista por papel (12 papéis, sem CEO)", () => {
    const specialists = createAISpecialists();

    expect(specialists).toHaveLength(12);
    expect(specialists.map((s) => s.role)).not.toContain("ceo");
  });

  it("produz um parecer estruturado a partir da resposta do AI Gateway", async () => {
    mockSuccessfulExecution({
      conclusao: "Recomendo avançar com a campanha em fases.",
      justificativa: "O histórico de retenção justifica um teste controlado antes do investimento total.",
      riscos: "Custo de aquisição elevado;Concorrência agressiva",
      oportunidades: "Retargeting pago;Parcerias com influenciadores",
      nivel_confianca: "78",
      prioridade: "82",
    });

    const [finance] = createAISpecialists();
    const result = await finance.provideOpinion(baseInput);

    expect(result).toEqual({
      summary: "O histórico de retenção justifica um teste controlado antes do investimento total.",
      recommendation: "Recomendo avançar com a campanha em fases.",
      priority: 82,
      confidence: 78,
      risks: ["Custo de aquisição elevado", "Concorrência agressiva"],
      opportunities: ["Retargeting pago", "Parcerias com influenciadores"],
      conclusion: "Recomendo avançar com a campanha em fases.",
      justification: "O histórico de retenção justifica um teste controlado antes do investimento total.",
      providerId: "openai",
      model: "gpt-4o-mini",
    });
  });

  it("chama o Gateway com a operação generateStructuredOutput e o schema esperado", async () => {
    mockSuccessfulExecution({ conclusao: "ok", justificativa: "ok" });

    const [finance] = createAISpecialists();
    await finance.provideOpinion(baseInput);

    expect(executeRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        operation: "generateStructuredOutput",
        schema: expect.objectContaining({
          conclusao: expect.any(String),
          justificativa: expect.any(String),
          riscos: expect.any(String),
          oportunidades: expect.any(String),
          nivel_confianca: expect.any(String),
          prioridade: expect.any(String),
        }),
        enableFallback: true,
      }),
    );
  });

  it("usa valores default defensivos quando o JSON estruturado vem incompleto/malformado", async () => {
    mockSuccessfulExecution({ nivel_confianca: "not-a-number" });

    const [finance] = createAISpecialists();
    const result = await finance.provideOpinion(baseInput);

    expect(result.confidence).toBe(50);
    expect(result.priority).toBe(50);
    expect(result.risks).toEqual([]);
    expect(result.opportunities).toEqual([]);
    expect(result.conclusion).toBeUndefined();
    expect(result.justification).toBeUndefined();
  });

  it("propaga (lança) o erro quando o provider falha — isolamento é responsabilidade do chamador", async () => {
    executeRequestMock.mockRejectedValue(new Error("no available provider"));

    const [finance] = createAISpecialists();

    await expect(finance.provideOpinion(baseInput)).rejects.toThrow("no available provider");
  });

  it("lança imediatamente sem chamar o Gateway quando EXECUTIVE_COUNCIL_AI_ENABLED=false (kill-switch)", async () => {
    process.env.EXECUTIVE_COUNCIL_AI_ENABLED = "false";

    const [finance] = createAISpecialists();

    await expect(finance.provideOpinion(baseInput)).rejects.toThrow(/desabilitada/);
    expect(createAIProviderMock).not.toHaveBeenCalled();
  });

  it("propaga EXECUTIVE_COUNCIL_AI_PREFERRED_PROVIDER como preferredType", async () => {
    process.env.EXECUTIVE_COUNCIL_AI_PREFERRED_PROVIDER = "anthropic";
    mockSuccessfulExecution({ conclusao: "ok", justificativa: "ok" });

    const [finance] = createAISpecialists();
    await finance.provideOpinion(baseInput);

    expect(executeRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ preferredType: "anthropic" }),
    );
  });
});
