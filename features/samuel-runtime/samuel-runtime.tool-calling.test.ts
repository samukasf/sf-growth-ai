import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runSamuelRuntime } from "./samuel-runtime.service";

let originalKillSwitch: string | undefined;

beforeEach(() => {
  originalKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  else process.env.SAMUEL_TOOL_CALLING_ENABLED = originalKillSwitch;
});

describe("runSamuelRuntime — Tool Calling Integration (Sprint 80)", () => {
  it("planeja e executa a calculator quando a pergunta contém uma expressão aritmética", async () => {
    const result = await runSamuelRuntime({
      query: "Quanto é 856 × 347?",
      animate: false,
    });

    expect(result.tooling).toEqual({
      attempted: true,
      toolName: "calculator",
      reason: expect.any(String),
      input: { a: 856, operator: "*", b: 347 },
      output: { result: 297032 },
      status: "success",
      error: undefined,
      durationMs: expect.any(Number),
    });
    expect(result.response.narrative).toContain("297032");
    expect(result.pipeline.find((step) => step.id === "tooling")?.status).toBe("complete");
  });

  it("não aciona nenhuma ferramenta para perguntas de negócio comuns e mantém o fluxo atual", async () => {
    const result = await runSamuelRuntime({
      query: "Analise minha empresa",
      animate: false,
    });

    expect(result.tooling).toEqual({ attempted: false });
    expect(result.response.narrative.length).toBeGreaterThan(0);
  });

  it("registra erro e usa fallback seguro quando a ferramenta falha (ex.: divisão por zero)", async () => {
    const result = await runSamuelRuntime({
      query: "Quanto é 10 dividido por 0?",
      animate: false,
    });

    expect(result.tooling.attempted).toBe(true);
    expect(result.tooling.status).toBe("error");
    expect(result.tooling.error).toContain("Divisão por zero");
    expect(result.response.narrative.length).toBeGreaterThan(0);
    expect(result.response.narrative).not.toContain("Resultado do cálculo");
  });

  it("desliga o Tool Planning quando SAMUEL_TOOL_CALLING_ENABLED=false (kill-switch)", async () => {
    process.env.SAMUEL_TOOL_CALLING_ENABLED = "false";

    const result = await runSamuelRuntime({
      query: "Quanto é 856 × 347?",
      animate: false,
    });

    expect(result.tooling).toEqual({ attempted: false });
    expect(result.response.narrative).not.toContain("297032");
  });

  it("gera um UUID quando solicitado explicitamente", async () => {
    const result = await runSamuelRuntime({
      query: "Gere um UUID para este registro.",
      animate: false,
    });

    expect(result.tooling.attempted).toBe(true);
    expect(result.tooling.toolName).toBe("uuid");
    expect(result.tooling.status).toBe("success");
    expect((result.tooling.output as { uuids: string[] }).uuids).toHaveLength(1);
  });
});
