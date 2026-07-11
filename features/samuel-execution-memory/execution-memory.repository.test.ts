import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const { saveExecutionMemory } = await import("./execution-memory.repository");

const baseRecord = {
  executionId: "exec-1",
  timestamp: "2026-07-11T12:00:00.000Z",
  organizationId: "org-1",
  companyId: "company-1",
  userId: null,
  provider: "openai",
  model: "gpt-4o-mini",
  operation: "reason",
  context: { objective: "diagnóstico" },
  memoriesUsed: { summary: "memória" },
  decision: { title: "Decisão" },
  plan: { summary: "plano" },
  toolsExecuted: [{ id: "orchestrator" }],
  finalResponse: "Narrativa final.",
  inputTokens: 100,
  outputTokens: 50,
  estimatedCost: 0.01,
  executionTimeMs: 1234,
  status: "success" as const,
  error: null,
};

let originalKillSwitch: string | undefined;

beforeEach(() => {
  originalKillSwitch = process.env.SAMUEL_EXECUTION_MEMORY_ENABLED;
  delete process.env.SAMUEL_EXECUTION_MEMORY_ENABLED;
  insertMock.mockReset().mockResolvedValue({ error: null });
  fromMock.mockClear();
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_EXECUTION_MEMORY_ENABLED;
  else process.env.SAMUEL_EXECUTION_MEMORY_ENABLED = originalKillSwitch;
});

describe("saveExecutionMemory", () => {
  it("insere o registro mapeado para snake_case na tabela samuel_execution_memory", async () => {
    await saveExecutionMemory(baseRecord);

    expect(fromMock).toHaveBeenCalledWith("samuel_execution_memory");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "exec-1",
        organization_id: "org-1",
        company_id: "company-1",
        provider: "openai",
        model: "gpt-4o-mini",
        operation: "reason",
        tools_executed: [{ id: "orchestrator" }],
        final_response: "Narrativa final.",
        input_tokens: 100,
        output_tokens: 50,
        estimated_cost: 0.01,
        execution_time_ms: 1234,
        status: "success",
        error: null,
      }),
    );
  });

  it("não lança quando o insert falha — apenas loga o warning", async () => {
    insertMock.mockResolvedValue({ error: { message: "insert failed" } });

    await expect(saveExecutionMemory(baseRecord)).resolves.toBeUndefined();
  });

  it("não lança quando o client Supabase lança uma exceção", async () => {
    insertMock.mockRejectedValue(new Error("network down"));

    await expect(saveExecutionMemory(baseRecord)).resolves.toBeUndefined();
  });

  it("não chama o Supabase quando SAMUEL_EXECUTION_MEMORY_ENABLED=false (kill-switch)", async () => {
    process.env.SAMUEL_EXECUTION_MEMORY_ENABLED = "false";

    await saveExecutionMemory(baseRecord);

    expect(fromMock).not.toHaveBeenCalled();
  });
});
