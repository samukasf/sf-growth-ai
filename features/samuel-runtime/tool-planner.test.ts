import { describe, expect, it } from "vitest";

import { createToolPlanner, DEFAULT_TOOL_DETECTORS, ToolPlanner } from "./tool-planner";

describe("ToolPlanner", () => {
  it("seleciona a calculator para uma expressão aritmética com símbolo unicode (×)", () => {
    const plan = createToolPlanner().plan("Quanto é 856 × 347?");

    expect(plan).toEqual({
      selected: true,
      toolName: "calculator",
      input: { a: 856, operator: "*", b: 347 },
      reason: expect.stringContaining("856 × 347"),
    });
  });

  it("seleciona a calculator para operadores por extenso", () => {
    const plan = createToolPlanner().plan("Quanto é 20 dividido por 4?");

    expect(plan).toEqual({
      selected: true,
      toolName: "calculator",
      input: { a: 20, operator: "/", b: 4 },
      reason: expect.any(String),
    });
  });

  it("seleciona a date-time para perguntas sobre data/hora atual", () => {
    const plan = createToolPlanner().plan("Que horas são agora?");

    expect(plan).toEqual({
      selected: true,
      toolName: "date-time",
      input: { format: "readable" },
      reason: expect.any(String),
    });
  });

  it("seleciona a uuid para pedidos de identificador único", () => {
    const plan = createToolPlanner().plan("Gere um UUID para este registro.");

    expect(plan).toEqual({
      selected: true,
      toolName: "uuid",
      input: { count: 1 },
      reason: expect.any(String),
    });
  });

  it("seleciona a json-formatter quando há um trecho JSON na mensagem", () => {
    const plan = createToolPlanner().plan('Formate esse json: {"a":1,"b":2}');

    expect(plan).toEqual({
      selected: true,
      toolName: "json-formatter",
      input: { raw: '{"a":1,"b":2}' },
      reason: expect.any(String),
    });
  });

  it("não seleciona json-formatter quando pede para formatar mas não há JSON na mensagem", () => {
    const plan = createToolPlanner().plan("Formate esse json para mim, por favor.");

    expect(plan).toEqual({ selected: false });
  });

  it("devolve selected:false para perguntas de negócio comuns", () => {
    const planner = createToolPlanner();

    expect(planner.plan("Analise minha empresa")).toEqual({ selected: false });
    expect(planner.plan("Crie uma campanha para minha empresa.")).toEqual({ selected: false });
    expect(planner.plan("Explique SEO e aplique na minha empresa.")).toEqual({ selected: false });
    expect(planner.plan("Responda meus e-mails.")).toEqual({ selected: false });
    expect(planner.plan("Analise meu faturamento.")).toEqual({ selected: false });
  });

  it("respeita a ordem de prioridade dos detectores injetados", () => {
    const alwaysCalculator = {
      toolName: "calculator",
      detect: () => ({ input: { a: 1, operator: "+" as const, b: 1 }, reason: "forçado" }),
    };
    const alwaysUuid = {
      toolName: "uuid",
      detect: () => ({ input: { count: 1 }, reason: "forçado" }),
    };

    const planner = new ToolPlanner([alwaysUuid, alwaysCalculator]);

    expect(planner.plan("qualquer coisa")).toEqual({
      selected: true,
      toolName: "uuid",
      input: { count: 1 },
      reason: "forçado",
    });
  });

  it("expõe exatamente os 4 detectores suportados nesta sprint por padrão", () => {
    expect(DEFAULT_TOOL_DETECTORS.map((detector) => detector.toolName)).toEqual([
      "calculator",
      "date-time",
      "uuid",
      "json-formatter",
    ]);
  });
});
