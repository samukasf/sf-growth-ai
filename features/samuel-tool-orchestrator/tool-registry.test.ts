import { describe, expect, it } from "vitest";

import { createToolRegistry, ImmutableToolRegistry } from "./tool-registry";
import type { Tool } from "./types";

function fakeTool(name: string, description = `${name} description`): Tool {
  return {
    name,
    description,
    async execute() {
      return { ok: true };
    },
  };
}

describe("ImmutableToolRegistry", () => {
  it("indexa as tools por nome e permite buscá-las via get/has", () => {
    const calculator = fakeTool("calculator");
    const uuid = fakeTool("uuid");
    const registry = createToolRegistry([calculator, uuid]);

    expect(registry.has("calculator")).toBe(true);
    expect(registry.has("uuid")).toBe(true);
    expect(registry.has("inexistente")).toBe(false);
    expect(registry.get("calculator")).toBe(calculator);
    expect(registry.get("inexistente")).toBeUndefined();
  });

  it("list() devolve apenas name/description, na mesma ordem recebida", () => {
    const registry = createToolRegistry([fakeTool("a"), fakeTool("b")]);

    expect(registry.list()).toEqual([
      { name: "a", description: "a description" },
      { name: "b", description: "b description" },
    ]);
  });

  it("expõe tools como um array congelado (imutável)", () => {
    const registry = createToolRegistry([fakeTool("a")]) as ImmutableToolRegistry;

    expect(Object.isFrozen(registry.tools)).toBe(true);
    expect(() => {
      (registry.tools as Tool[]).push(fakeTool("b"));
    }).toThrow();
  });

  it("lança na construção quando há nomes de Tool duplicados (fail-fast)", () => {
    expect(() => createToolRegistry([fakeTool("dup"), fakeTool("dup")])).toThrow(
      /duplicado.*"dup"/,
    );
  });

  it("cada chamada de createToolRegistry produz uma instância independente (sem estado global)", () => {
    const registryA = createToolRegistry([fakeTool("a")]);
    const registryB = createToolRegistry([fakeTool("b")]);

    expect(registryA.has("b")).toBe(false);
    expect(registryB.has("a")).toBe(false);
  });
});
