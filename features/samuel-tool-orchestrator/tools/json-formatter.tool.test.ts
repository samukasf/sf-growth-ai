import { describe, expect, it } from "vitest";

import { ToolExecutionError } from "../tool-execution-error";
import { JSONFormatterTool } from "./json-formatter.tool";
import type { JSONFormatterToolInput } from "./json-formatter.tool";

function context(input: JSONFormatterToolInput) {
  return {
    requestId: "req-1",
    input,
    requestedAt: new Date().toISOString(),
  };
}

describe("JSONFormatterTool", () => {
  const tool = new JSONFormatterTool();

  it("formata um JSON válido com indentação default (2)", async () => {
    const result = await tool.execute(context({ raw: '{"a":1,"b":[1,2,3]}' }));

    expect(result.formatted).toBe(JSON.stringify({ a: 1, b: [1, 2, 3] }, null, 2));
  });

  it("respeita a indentação customizada", async () => {
    const result = await tool.execute(context({ raw: '{"a":1}', indent: 4 }));

    expect(result.formatted).toBe(JSON.stringify({ a: 1 }, null, 4));
  });

  it("lança ToolExecutionError para JSON inválido", async () => {
    await expect(tool.execute(context({ raw: "{invalid json" }))).rejects.toThrow(
      ToolExecutionError,
    );
    await expect(tool.execute(context({ raw: "{invalid json" }))).rejects.toThrow(
      /JSON inválido/i,
    );
  });

  it("lança ToolExecutionError quando 'raw' está vazio ou ausente", async () => {
    await expect(tool.execute(context({ raw: "" }))).rejects.toThrow(/raw.*string JSON/i);
    await expect(
      tool.execute(context({} as unknown as JSONFormatterToolInput)),
    ).rejects.toThrow(/raw.*string JSON/i);
  });

  it("lança ToolExecutionError quando 'indent' é inválido", async () => {
    await expect(tool.execute(context({ raw: "{}", indent: -1 }))).rejects.toThrow(
      /indent.*inválido/i,
    );
    await expect(tool.execute(context({ raw: "{}", indent: 11 }))).rejects.toThrow(
      /indent.*inválido/i,
    );
  });

  it("expõe name/description/inputSchema", () => {
    expect(tool.name).toBe("json-formatter");
    expect(tool.description).toBeTruthy();
    expect(tool.inputSchema).toMatchObject({ raw: expect.any(String), indent: expect.any(String) });
  });
});
