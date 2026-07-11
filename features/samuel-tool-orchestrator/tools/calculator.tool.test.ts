import { describe, expect, it } from "vitest";

import { ToolExecutionError } from "../tool-execution-error";
import { CalculatorTool } from "./calculator.tool";

function context(input: { a: number; operator: string; b: number }) {
  return {
    requestId: "req-1",
    input: input as never,
    requestedAt: new Date().toISOString(),
  };
}

describe("CalculatorTool", () => {
  const tool = new CalculatorTool();

  it("soma corretamente", async () => {
    await expect(tool.execute(context({ a: 2, operator: "+", b: 3 }))).resolves.toEqual({
      result: 5,
    });
  });

  it("subtrai corretamente", async () => {
    await expect(tool.execute(context({ a: 10, operator: "-", b: 4 }))).resolves.toEqual({
      result: 6,
    });
  });

  it("multiplica corretamente", async () => {
    await expect(tool.execute(context({ a: 6, operator: "*", b: 7 }))).resolves.toEqual({
      result: 42,
    });
  });

  it("divide corretamente", async () => {
    await expect(tool.execute(context({ a: 20, operator: "/", b: 4 }))).resolves.toEqual({
      result: 5,
    });
  });

  it("lança ToolExecutionError em divisão por zero", async () => {
    await expect(tool.execute(context({ a: 1, operator: "/", b: 0 }))).rejects.toThrow(
      ToolExecutionError,
    );
    await expect(tool.execute(context({ a: 1, operator: "/", b: 0 }))).rejects.toThrow(
      /divisão por zero/i,
    );
  });

  it("lança ToolExecutionError para operador inválido", async () => {
    await expect(tool.execute(context({ a: 1, operator: "%", b: 2 }))).rejects.toThrow(
      /operador inválido/i,
    );
  });

  it("lança ToolExecutionError quando 'a' ou 'b' não são números", async () => {
    await expect(
      tool.execute(context({ a: Number.NaN, operator: "+", b: 2 })),
    ).rejects.toThrow(/números válidos/i);
  });

  it("expõe name/description/inputSchema", () => {
    expect(tool.name).toBe("calculator");
    expect(tool.description).toBeTruthy();
    expect(tool.inputSchema).toMatchObject({ a: expect.any(String), operator: expect.any(String), b: expect.any(String) });
  });
});
