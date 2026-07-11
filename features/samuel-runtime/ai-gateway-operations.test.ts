import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_SAMUEL_AI_OPERATION,
  resolveGatewayOperation,
  resolveSamuelOperation,
} from "./ai-gateway-operations";

const ENV_KEY = "SAMUEL_AI_GATEWAY_OPERATION";
let originalEnv: string | undefined;

beforeEach(() => {
  originalEnv = process.env[ENV_KEY];
  delete process.env[ENV_KEY];
});

afterEach(() => {
  if (originalEnv === undefined) delete process.env[ENV_KEY];
  else process.env[ENV_KEY] = originalEnv;
});

describe("resolveSamuelOperation", () => {
  it("usa 'reason' como default quando nada é informado", () => {
    expect(resolveSamuelOperation()).toBe("reason");
    expect(DEFAULT_SAMUEL_AI_OPERATION).toBe("reason");
  });

  it("prioriza o valor explícito do contexto da chamada", () => {
    process.env[ENV_KEY] = "summarize";
    expect(resolveSamuelOperation("classify")).toBe("classify");
  });

  it("usa a variável de ambiente quando não há valor explícito", () => {
    process.env[ENV_KEY] = "summarize";
    expect(resolveSamuelOperation()).toBe("summarize");
  });

  it("ignora variável de ambiente inválida e usa o default", () => {
    process.env[ENV_KEY] = "not-a-real-operation";
    expect(resolveSamuelOperation()).toBe("reason");
  });
});

describe("resolveGatewayOperation", () => {
  it.each([
    ["reason", "reason"],
    ["generateText", "generateText"],
    ["summarize", "summarize"],
    ["classify", "classify"],
    ["extract", "extractEntities"],
  ] as const)("mapeia '%s' para a AIOperation '%s' já suportada pelo Gateway", (input, expected) => {
    const result = resolveGatewayOperation(input);
    expect(result.gatewayOperation).toBe(expected);
    expect(result.supported).toBe(true);
  });

  it.each(["plan", "critique", "evaluate"] as const)(
    "modo reservado '%s' cai para 'reason' e sinaliza supported=false",
    (input) => {
      const result = resolveGatewayOperation(input);
      expect(result.gatewayOperation).toBe("reason");
      expect(result.supported).toBe(false);
      expect(result.requestedOperation).toBe(input);
    },
  );
});
