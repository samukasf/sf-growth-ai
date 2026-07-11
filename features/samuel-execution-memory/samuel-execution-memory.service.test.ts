import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runSamuelRuntimeMock = vi.fn();
const saveExecutionMemoryMock = vi.fn();
const resolveExecutionUserIdMock = vi.fn();

vi.mock("@/features/samuel-runtime", () => ({
  runSamuelRuntime: runSamuelRuntimeMock,
}));

vi.mock("./execution-memory.repository", () => ({
  saveExecutionMemory: saveExecutionMemoryMock,
}));

vi.mock("./resolve-execution-user", () => ({
  resolveExecutionUserId: resolveExecutionUserIdMock,
}));

const { runSamuelRuntimeWithExecutionMemory } = await import("./samuel-execution-memory.service");

function buildRuntimeResponse(overrides: Record<string, unknown> = {}) {
  return {
    query: "Analise minha empresa",
    pipeline: [{ id: "orchestrator", label: "Samuel Orchestrator", status: "complete" }],
    memory: { summary: "Memória carregada", insights: ["padrão A"] },
    context: { objective: "Diagnóstico", fields: [] },
    companyBrain: { status: "active", headline: "ok", facts: [], confidence: 80 },
    executiveCouncil: { status: "ready", memberCount: 3, consensus: "consenso", specialists: [] },
    decision: { title: "Decisão", rationale: "racional", priority: "alta", nextAction: "agir", confidence: 80 },
    response: {
      headline: "Análise concluída",
      narrative: "Narrativa final.",
      actionPlanSummary: "Resumo do plano",
      actions: [{ title: "Ação 1", description: "d", priority: "alta", timeframe: "7 dias", impact: "alto" }],
      confidence: { score: 80, level: "alta", rationale: "r" },
    },
    aiGateway: { used: false },
    generatedAt: "2026-07-11T12:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  runSamuelRuntimeMock.mockReset();
  saveExecutionMemoryMock.mockReset().mockResolvedValue(undefined);
  resolveExecutionUserIdMock.mockReset().mockResolvedValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runSamuelRuntimeWithExecutionMemory", () => {
  it("devolve exatamente o RuntimeResponse do Samuel, sem alterá-lo", async () => {
    const response = buildRuntimeResponse();
    runSamuelRuntimeMock.mockResolvedValue(response);

    const result = await runSamuelRuntimeWithExecutionMemory({
      query: "Analise minha empresa",
      organizationId: "org-1",
      companyId: "company-1",
    });

    expect(result).toBe(response);
    expect(runSamuelRuntimeMock).toHaveBeenCalledWith(
      expect.objectContaining({ query: "Analise minha empresa" }),
    );
  });

  it("persiste um registro de sucesso com os campos derivados do RuntimeResponse", async () => {
    const response = buildRuntimeResponse({
      aiGateway: {
        used: true,
        providerId: "openai",
        model: "gpt-4o-mini",
        operation: "reason",
        promptTokens: 100,
        completionTokens: 50,
        estimatedCostUsd: 0.005,
      },
    });
    runSamuelRuntimeMock.mockResolvedValue(response);
    resolveExecutionUserIdMock.mockResolvedValue("user-1");

    await runSamuelRuntimeWithExecutionMemory({
      query: "Analise minha empresa",
      organizationId: "org-1",
      companyId: "company-1",
    });

    expect(saveExecutionMemoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        companyId: "company-1",
        userId: "user-1",
        provider: "openai",
        model: "gpt-4o-mini",
        operation: "reason",
        inputTokens: 100,
        outputTokens: 50,
        estimatedCost: 0.005,
        finalResponse: "Narrativa final.",
        toolsExecuted: response.pipeline,
        memoriesUsed: response.memory,
        decision: response.decision,
        status: "success",
        error: null,
      }),
    );
  });

  it("persiste um registro de erro e relança a mesma exceção quando o Samuel falha", async () => {
    const originalError = new Error("Company Brain indisponível");
    runSamuelRuntimeMock.mockRejectedValue(originalError);

    await expect(
      runSamuelRuntimeWithExecutionMemory({
        query: "Analise minha empresa",
        organizationId: "org-1",
        companyId: "company-1",
      }),
    ).rejects.toThrow("Company Brain indisponível");

    expect(saveExecutionMemoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        companyId: "company-1",
        status: "error",
        error: "Company Brain indisponível",
        finalResponse: null,
      }),
    );
  });

  it("resolve userId via resolveExecutionUserId passando o authorizationHeader e o userId de fallback", async () => {
    runSamuelRuntimeMock.mockResolvedValue(buildRuntimeResponse());

    await runSamuelRuntimeWithExecutionMemory({
      query: "Analise minha empresa",
      organizationId: "org-1",
      companyId: "company-1",
      userId: "dev-user",
      authorizationHeader: "Bearer token-123",
    });

    expect(resolveExecutionUserIdMock).toHaveBeenCalledWith({
      authorizationHeader: "Bearer token-123",
      fallbackUserId: "dev-user",
    });
  });
});
