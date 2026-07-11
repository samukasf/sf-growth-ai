import { describe, expect, it } from "vitest";

import { DateTimeTool } from "./date-time.tool";
import type { DateTimeToolInput } from "./date-time.tool";

function context(input: DateTimeToolInput = {}) {
  return {
    requestId: "req-1",
    input,
    requestedAt: new Date().toISOString(),
  };
}

describe("DateTimeTool", () => {
  const tool = new DateTimeTool();

  it("usa 'iso' como formato default quando nenhum é informado", async () => {
    const result = await tool.execute(context());

    expect(result.format).toBe("iso");
    expect(() => new Date(result.value).toISOString()).not.toThrow();
    expect(new Date(result.value).toISOString()).toBe(result.value);
  });

  it("devolve o formato 'unix' como string de milissegundos", async () => {
    const before = Date.now();
    const result = await tool.execute(context({ format: "unix" }));
    const after = Date.now();

    expect(result.format).toBe("unix");
    const value = Number(result.value);
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(after);
  });

  it("devolve o formato 'readable' como string legível (UTC)", async () => {
    const result = await tool.execute(context({ format: "readable" }));

    expect(result.format).toBe("readable");
    expect(result.value).toMatch(/GMT$/);
  });

  it("lança ToolExecutionError para formato inválido", async () => {
    await expect(
      tool.execute(context({ format: "invalid" as DateTimeToolInput["format"] })),
    ).rejects.toThrow(/formato inválido/i);
  });

  it("expõe name/description/inputSchema", () => {
    expect(tool.name).toBe("date-time");
    expect(tool.description).toBeTruthy();
    expect(tool.inputSchema).toMatchObject({ format: expect.any(String) });
  });
});
