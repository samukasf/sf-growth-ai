import { describe, expect, it } from "vitest";

import { normalizeIntentQuery } from "../intent-normalizer";

import { PT_BR_INTENT_RULE_SET } from "./pt-br.rules";

function detectAll(query: string) {
  const normalized = normalizeIntentQuery(query);
  return PT_BR_INTENT_RULE_SET.rules
    .map((rule) => rule.detect(normalized))
    .filter((signal): signal is NonNullable<typeof signal> => signal !== null);
}

describe("PT_BR_INTENT_RULE_SET", () => {
  it("is immutable", () => {
    expect(Object.isFrozen(PT_BR_INTENT_RULE_SET)).toBe(true);
    expect(Object.isFrozen(PT_BR_INTENT_RULE_SET.rules)).toBe(true);
  });

  it("detects a math expression as GENERAL_KNOWLEDGE", () => {
    const signals = detectAll("Quanto é 500x78?");
    expect(signals.some((s) => s.category === "GENERAL_KNOWLEDGE")).toBe(true);
  });

  it("detects a strategic business creation request as BUSINESS", () => {
    const signals = detectAll("Crie um plano de marketing.");
    expect(signals.some((s) => s.category === "BUSINESS")).toBe(true);
  });

  it("detects an explanation applied to the user's business as HYBRID", () => {
    const signals = detectAll("Explique SEO e aplique na minha empresa.");
    expect(signals.some((s) => s.category === "HYBRID")).toBe(true);
  });

  it("detects a routine task request as AUTOMATION", () => {
    const signals = detectAll("Responda meus e-mails.");
    expect(signals.some((s) => s.category === "AUTOMATION")).toBe(true);
  });

  it("detects a business metric analysis request as ANALYSIS", () => {
    const signals = detectAll("Analise meu faturamento.");
    expect(signals.some((s) => s.category === "ANALYSIS")).toBe(true);
  });

  it("detects a digital artifact creation request as CREATION", () => {
    const signals = detectAll("Crie um site para minha empresa.");
    expect(signals.some((s) => s.category === "CREATION")).toBe(true);
  });

  it("returns no signals for unrelated neutral text", () => {
    const signals = detectAll("Bom dia.");
    expect(signals).toHaveLength(0);
  });
});
