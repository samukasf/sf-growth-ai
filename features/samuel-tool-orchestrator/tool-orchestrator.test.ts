import { describe, expect, it } from "vitest";

import { createToolOrchestrator, ToolOrchestrator } from "./tool-orchestrator";
import { createToolRegistry } from "./tool-registry";
import { ToolExecutionError } from "./tool-execution-error";
import type { Tool, ToolExecutionContext } from "./types";

function echoTool(name: string): Tool<{ value: string }, { echoed: string }> {
  return {
    name,
    description: `Echoes ${name}`,
    async execute(context: ToolExecutionContext<{ value: string }>) {
      return { echoed: context.input.value };
    },
  };
}

function throwingTool(name: string, error: unknown): Tool {
  return {
    name,
    description: `Always throws (${name})`,
    async execute() {
      throw error;
    },
  };
}

describe("ToolOrchestrator", () => {
  it("executa uma Tool existente e devolve ToolResult de sucesso com o output", async () => {
    const orchestrator = new ToolOrchestrator(createToolRegistry([echoTool("echo")]));

    const result = await orchestrator.execute("echo", { value: "olá" });

    expect(result.status).toBe("success");
    expect(result.output).toEqual({ echoed: "olá" });
    expect(result.error).toBeUndefined();
    expect(result.toolName).toBe("echo");
  });

  it("nunca lança quando a Tool não existe — devolve ToolResult de erro", async () => {
    const orchestrator = new ToolOrchestrator(createToolRegistry([echoTool("echo")]));

    const result = await orchestrator.execute("inexistente", {});

    expect(result.status).toBe("error");
    expect(result.error).toMatch(/inexistente.*não encontrada/);
    expect(result.output).toBeUndefined();
  });

  it("nunca lança quando a Tool lança um Error genérico — normaliza em ToolResult.error", async () => {
    const orchestrator = new ToolOrchestrator(
      createToolRegistry([throwingTool("falha", new Error("algo quebrou"))]),
    );

    const result = await orchestrator.execute("falha", {});

    expect(result.status).toBe("error");
    expect(result.error).toBe("algo quebrou");
  });

  it("nunca lança quando a Tool lança um ToolExecutionError — normaliza a mensagem", async () => {
    const orchestrator = new ToolOrchestrator(
      createToolRegistry([throwingTool("falha-tipada", new ToolExecutionError("falha-tipada", "divisão por zero"))]),
    );

    const result = await orchestrator.execute("falha-tipada", {});

    expect(result.status).toBe("error");
    expect(result.error).toBe("divisão por zero");
  });

  it("normaliza erros não-Error (ex.: string/objeto lançado) em ToolResult.error", async () => {
    const orchestrator = new ToolOrchestrator(
      createToolRegistry([throwingTool("falha-string", "erro cru")]),
    );

    const result = await orchestrator.execute("falha-string", {});

    expect(result.status).toBe("error");
    expect(result.error).toBe("erro cru");
  });

  it("sempre preenche startedAt/completedAt/durationMs, mesmo em erro", async () => {
    const orchestrator = new ToolOrchestrator(createToolRegistry([echoTool("echo")]));

    const success = await orchestrator.execute("echo", { value: "x" });
    const failure = await orchestrator.execute("inexistente", {});

    for (const result of [success, failure]) {
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(typeof result.durationMs).toBe("number");
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(new Date(result.completedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(result.startedAt).getTime(),
      );
    }
  });

  it("gera um requestId por chamada quando não informado, e usa o override quando fornecido", async () => {
    const receivedRequestIds: string[] = [];
    const capturingTool: Tool = {
      name: "capture",
      description: "captures the context it receives",
      async execute(context) {
        receivedRequestIds.push(context.requestId);
        return null;
      },
    };
    const orchestrator = new ToolOrchestrator(createToolRegistry([capturingTool]));

    await orchestrator.execute("capture", {});
    await orchestrator.execute("capture", {}, { requestId: "req-fixo" });

    expect(receivedRequestIds[0]).toBeTruthy();
    expect(receivedRequestIds[1]).toBe("req-fixo");
    expect(receivedRequestIds[0]).not.toBe(receivedRequestIds[1]);
  });

  it("propaga organizationId/companyId opcionais para o contexto da Tool", async () => {
    let capturedContext: ToolExecutionContext | undefined;
    const capturingTool: Tool = {
      name: "capture-org",
      description: "captures organizationId/companyId",
      async execute(context) {
        capturedContext = context;
        return null;
      },
    };
    const orchestrator = new ToolOrchestrator(createToolRegistry([capturingTool]));

    await orchestrator.execute(
      "capture-org",
      { any: "input" },
      { organizationId: "org-1", companyId: "company-1" },
    );

    expect(capturedContext?.organizationId).toBe("org-1");
    expect(capturedContext?.companyId).toBe("company-1");
    expect(capturedContext?.input).toEqual({ any: "input" });
  });

  it("listAvailableTools() expõe apenas name/description das Tools plugadas", () => {
    const orchestrator = new ToolOrchestrator(
      createToolRegistry([echoTool("echo"), echoTool("echo2")]),
    );

    expect(orchestrator.listAvailableTools()).toEqual([
      { name: "echo", description: "Echoes echo" },
      { name: "echo2", description: "Echoes echo2" },
    ]);
  });

  describe("createToolOrchestrator", () => {
    it("usa as Tools MOCK por padrão quando nenhuma é informada", () => {
      const orchestrator = createToolOrchestrator();
      const names = orchestrator.listAvailableTools().map((tool) => tool.name);

      expect(names).toEqual(
        expect.arrayContaining(["calculator", "date-time", "uuid", "json-formatter"]),
      );
    });

    it("aceita uma lista de tools customizada (plugável)", () => {
      const orchestrator = createToolOrchestrator({ tools: [echoTool("custom-echo")] });

      expect(orchestrator.listAvailableTools()).toEqual([
        { name: "custom-echo", description: "Echoes custom-echo" },
      ]);
    });

    it("aceita um registry pronto via options.registry", () => {
      const registry = createToolRegistry([echoTool("via-registry")]);
      const orchestrator = createToolOrchestrator({ registry });

      expect(orchestrator.listAvailableTools()).toEqual([
        { name: "via-registry", description: "Echoes via-registry" },
      ]);
    });

    it("cada chamada produz uma instância independente (sem estado global)", () => {
      const a = createToolOrchestrator({ tools: [echoTool("a")] });
      const b = createToolOrchestrator({ tools: [echoTool("b")] });

      expect(a.listAvailableTools().map((t) => t.name)).toEqual(["a"]);
      expect(b.listAvailableTools().map((t) => t.name)).toEqual(["b"]);
    });
  });
});
