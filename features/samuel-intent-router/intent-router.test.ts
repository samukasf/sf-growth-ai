import { describe, expect, it } from "vitest";

import { classifyIntent, createIntentRouter, IntentRouter } from "./intent-router";

import type { IntentLanguageRuleSet } from "./intent-router.types";

describe("Samuel Intent Router — classificação apenas, sem execução", () => {
  const examples: Array<{ query: string; expected: string }> = [
    { query: "Quanto é 500x78?", expected: "GENERAL_KNOWLEDGE" },
    { query: "Crie um plano de marketing.", expected: "BUSINESS" },
    { query: "Explique SEO e aplique na minha empresa.", expected: "HYBRID" },
    { query: "Responda meus e-mails.", expected: "AUTOMATION" },
    { query: "Analise meu faturamento.", expected: "ANALYSIS" },
    { query: "Crie um site para minha empresa.", expected: "CREATION" },
  ];

  it.each(examples)("classifica '$query' como $expected", ({ query, expected }) => {
    const result = createIntentRouter().classify(query);

    expect(result.category).toBe(expected);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.justification.length).toBeGreaterThan(0);
  });

  it("returns only classification fields — category, confidence, justification", () => {
    const result = createIntentRouter().classify("Analise meu faturamento.");

    expect(Object.keys(result).sort()).toEqual(["category", "confidence", "justification"]);
  });

  it("falls back to a low-confidence default for empty input", () => {
    const result = createIntentRouter().classify("");

    expect(result.category).toBeTruthy();
    expect(result.confidence).toBeLessThan(0.5);
  });

  it("does not mutate any shared state between calls (no global registry)", () => {
    const routerA = createIntentRouter();
    const routerB = createIntentRouter();

    const resultA1 = routerA.classify("Crie um plano de marketing.");
    const resultB1 = routerB.classify("Crie um plano de marketing.");
    const resultA2 = routerA.classify("Crie um plano de marketing.");

    expect(resultA1).toEqual(resultB1);
    expect(resultA1).toEqual(resultA2);
  });

  it("accepts injected, immutable rule sets via the factory — no keyword hardcoded in the engine", () => {
    const customRuleSet: IntentLanguageRuleSet = Object.freeze({
      language: "test-lang",
      rules: Object.freeze([
        Object.freeze({
          id: "test.always-automation",
          category: "AUTOMATION" as const,
          detect: () => ({
            category: "AUTOMATION" as const,
            strength: 1,
            reason: "regra de teste injetada",
          }),
        }),
      ]),
    });

    const router = new IntentRouter([customRuleSet]);
    const result = router.classify("qualquer coisa", "test-lang");

    expect(result.category).toBe("AUTOMATION");
    expect(result.justification).toContain("regra de teste injetada");
  });

  it("keeps injected rule sets immutable — external mutation attempts do not affect classification", () => {
    const mutableSource: IntentLanguageRuleSet[] = [
      Object.freeze({
        language: "test-lang",
        rules: Object.freeze([
          Object.freeze({
            id: "test.rule",
            category: "CREATION" as const,
            detect: () => ({ category: "CREATION" as const, strength: 1, reason: "fixed" }),
          }),
        ]),
      }),
    ];

    const router = new IntentRouter(mutableSource);
    mutableSource.push({ language: "another", rules: [] });

    const result = router.classify("qualquer coisa", "test-lang");
    expect(result.category).toBe("CREATION");
  });

  it("classifyIntent convenience function produces the same result as the class directly", () => {
    const viaFunction = classifyIntent("Analise meu faturamento.");
    const viaClass = createIntentRouter().classify("Analise meu faturamento.");

    expect(viaFunction).toEqual(viaClass);
  });
});
