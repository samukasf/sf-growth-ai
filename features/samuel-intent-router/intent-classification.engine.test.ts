import { describe, expect, it } from "vitest";

import { aggregateIntentSignals } from "./intent-classification.engine";

import type { IntentSignal } from "./intent-router.types";

/**
 * Estes testes usam sinais sintéticos (não português, não qualquer idioma
 * real) para provar que o motor de classificação é 100% agnóstico de
 * idioma — ele só sabe somar `IntentSignal[]`, nunca interpreta texto.
 */
describe("aggregateIntentSignals", () => {
  it("returns a low-confidence fallback when no signals are provided", () => {
    const result = aggregateIntentSignals([]);

    expect(result.category).toBe("GENERAL_KNOWLEDGE");
    expect(result.confidence).toBeLessThan(0.5);
    expect(result.justification.length).toBeGreaterThan(0);
  });

  it("picks the category with the highest aggregated strength", () => {
    const signals: IntentSignal[] = [
      { category: "AUTOMATION", strength: 0.9, reason: "synthetic-signal-a" },
      { category: "ANALYSIS", strength: 0.2, reason: "synthetic-signal-b" },
    ];

    const result = aggregateIntentSignals(signals);

    expect(result.category).toBe("AUTOMATION");
    expect(result.justification).toContain("synthetic-signal-a");
  });

  it("sums multiple signals of the same category", () => {
    const signals: IntentSignal[] = [
      { category: "CREATION", strength: 0.4, reason: "signal-1" },
      { category: "CREATION", strength: 0.4, reason: "signal-2" },
      { category: "BUSINESS", strength: 0.3, reason: "signal-3" },
    ];

    const result = aggregateIntentSignals(signals);

    expect(result.category).toBe("CREATION");
    expect(result.justification).toContain("signal-1");
    expect(result.justification).toContain("signal-2");
  });

  it("returns high confidence when a single category dominates with no competition", () => {
    const result = aggregateIntentSignals([
      { category: "HYBRID", strength: 0.9, reason: "dominant-signal" },
    ]);

    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("returns lower confidence when two categories are close in score", () => {
    const result = aggregateIntentSignals([
      { category: "BUSINESS", strength: 0.5, reason: "signal-a" },
      { category: "CREATION", strength: 0.48, reason: "signal-b" },
    ]);

    expect(result.confidence).toBeLessThan(0.6);
  });

  it("never returns confidence outside the 0-1 range", () => {
    const result = aggregateIntentSignals([
      { category: "ANALYSIS", strength: 5, reason: "out-of-range-signal" },
    ]);

    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });
});
