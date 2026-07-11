import { describe, expect, it } from "vitest";

import { runSamuelRuntime } from "./samuel-runtime.service";

describe("runSamuelRuntime", () => {
  it("returns a structured RuntimeResponse for company analysis", async () => {
    const result = await runSamuelRuntime({
      query: "Analise minha empresa",
      organizationId: "test-org",
      companyId: "test-company",
      companyName: "Acme Labs",
      animate: false,
    });

    expect(result.query).toBe("Analise minha empresa");
    expect(result.pipeline).toHaveLength(7);
    expect(result.pipeline.every((step) => step.status === "complete")).toBe(true);
    expect(result.companyBrain.status).toBe("active");
    expect(result.executiveCouncil.status).toBe("ready");
    expect(result.executiveCouncil.memberCount).toBeGreaterThan(0);
    expect(result.decision.title).toBeTruthy();
    expect(result.response.headline).toContain("Acme Labs");
    expect(result.response.narrative.length).toBeGreaterThan(0);
    expect(result.response.actions.length).toBeGreaterThan(0);
    expect(result.generatedAt).toBeTruthy();
  });

  it("runs the full pipeline in order", async () => {
    const phases: string[] = [];

    await runSamuelRuntime({
      query: "Quais são minhas prioridades?",
      animate: false,
      onPhase: (phase) => {
        phases.push(phase);
      },
    });

    expect(phases).toEqual([
      "orchestrator",
      "memory",
      "context",
      "company_brain",
      "executive_council",
      "decision",
      "response",
    ]);
  });

  it("does not require OpenAI — response comes from orchestrator runtime", async () => {
    const result = await runSamuelRuntime({
      query: "Quero vender mais",
      animate: false,
    });

    expect(result.response.confidence.score).toBeGreaterThan(0);
    expect(result.memory.insights.length).toBeGreaterThan(0);
    expect(result.context.objective.length).toBeGreaterThan(0);
  });
});
