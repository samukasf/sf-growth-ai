import { describe, expect, it } from "vitest";

import { UUIDTool } from "./uuid.tool";
import type { UUIDToolInput } from "./uuid.tool";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function context(input: UUIDToolInput = {}) {
  return {
    requestId: "req-1",
    input,
    requestedAt: new Date().toISOString(),
  };
}

describe("UUIDTool", () => {
  const tool = new UUIDTool();

  it("gera 1 UUID v4 válido por padrão", async () => {
    const result = await tool.execute(context());

    expect(result.uuids).toHaveLength(1);
    expect(result.uuids[0]).toMatch(UUID_V4_REGEX);
  });

  it("gera N UUIDs quando 'count' é informado, todos únicos", async () => {
    const result = await tool.execute(context({ count: 5 }));

    expect(result.uuids).toHaveLength(5);
    for (const uuid of result.uuids) {
      expect(uuid).toMatch(UUID_V4_REGEX);
    }
    expect(new Set(result.uuids).size).toBe(5);
  });

  it("lança ToolExecutionError quando 'count' é menor que 1", async () => {
    await expect(tool.execute(context({ count: 0 }))).rejects.toThrow(/count.*inválido/i);
  });

  it("lança ToolExecutionError quando 'count' excede o máximo permitido", async () => {
    await expect(tool.execute(context({ count: 21 }))).rejects.toThrow(/count.*inválido/i);
  });

  it("lança ToolExecutionError quando 'count' não é um inteiro", async () => {
    await expect(tool.execute(context({ count: 1.5 }))).rejects.toThrow(/count.*inválido/i);
  });

  it("expõe name/description/inputSchema", () => {
    expect(tool.name).toBe("uuid");
    expect(tool.description).toBeTruthy();
    expect(tool.inputSchema).toMatchObject({ count: expect.any(String) });
  });
});
