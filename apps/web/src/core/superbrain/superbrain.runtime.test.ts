import { describe, expect, it } from "vitest";

import { runSuperbrain } from "./superbrain.runtime";

describe("SuperbrainRuntime", () => {
  it("runs end-to-end for analysis query", async () => {
    const result = await runSuperbrain({ query: "Analise minha empresa." });

    expect(result.query).toBe("Analise minha empresa.");
    expect(result.summary).toContain("Growth Score");
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.opportunities.length).toBeGreaterThan(0);
    expect(result.nextActions.length).toBeGreaterThan(0);
    expect(result.decision.priority).toBe("Critical");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
  });

  it("includes all pipeline steps including decision", async () => {
    const result = await runSuperbrain({ query: "Analise minha empresa." });
    const stepNames = result.pipeline.map((step) => step.name);

    expect(stepNames).toContain("load_memory");
    expect(stepNames).toContain("load_context");
    expect(stepNames).toContain("load_company_brain");
    expect(stepNames).toContain("load_executive_council");
    expect(stepNames).toContain("load_decision");
    expect(stepNames).toContain("prepare_response");

    for (const step of result.pipeline) {
      expect(step.durationMs).toBeGreaterThanOrEqual(0);
      expect(["success", "skipped"]).toContain(step.status);
    }
  });

  it("returns typed recommendations not loose JSON", async () => {
    const result = await runSuperbrain({ query: "Analise minha empresa." });
    const [first] = result.recommendations;

    expect(first).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      priority: expect.stringMatching(/Critical|High|Medium|Low/),
      department: expect.any(String),
      rationale: expect.any(String),
    });
  });
});
