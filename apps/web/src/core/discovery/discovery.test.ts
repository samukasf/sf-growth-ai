import { describe, expect, it } from "vitest";

import { runDiscovery } from "./discovery.service";
import { PIPELINE_DISPLAY_ORDER } from "./discovery.presenter";

describe("DiscoveryService", () => {
  it("runs full discovery pipeline with mock sources", async () => {
    const result = await runDiscovery({
      companyName: "GrafGil Impressões",
      website: "grafgil.com.br",
      instagram: "grafgil",
      facebook: "grafgil",
      city: "São Paulo",
    });

    expect(result.company).toBe("GrafGil Impressões");
    expect(result.website).toContain("grafgil.com.br");
    expect(result.industry).toBeTruthy();
    expect(result.services.length).toBeGreaterThan(0);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.weaknesses.length).toBeGreaterThan(0);
    expect(result.opportunities.length).toBeGreaterThan(0);
    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.executiveSummary).toBeTruthy();
    expect(result.nextSteps.length).toBeGreaterThan(0);
    expect(result.companyBrainId).toBeTruthy();
    expect(result.memoriesCreated).toBeGreaterThan(0);
    expect(result.contextFragmentCount).toBeGreaterThan(0);
  });

  it("includes all pipeline steps through completion", async () => {
    const result = await runDiscovery({
      companyName: "Acme Corp",
      city: "Rio de Janeiro",
    });

    const stepNames = result.pipeline.map((s) => s.name);
    expect(stepNames).toContain("validate");
    expect(stepNames).toContain("search_sources");
    expect(stepNames).toContain("generate_company_brain");
    expect(stepNames).toContain("save_memory");
    expect(stepNames).toContain("update_context");
    expect(stepNames).toContain("complete");
  });

  it("tracks missing information when social data absent", async () => {
    const result = await runDiscovery({ companyName: "Minimal Co" });

    expect(result.missingInformation).toContain("Website oficial");
    expect(result.missingInformation).toContain("Instagram");
    expect(result.confidence).toBeLessThan(80);
  });

  it("rejects invalid input", async () => {
    await expect(runDiscovery({ companyName: "" })).rejects.toThrow();
  });

  it("maps UI display pipeline order", () => {
    expect(PIPELINE_DISPLAY_ORDER).toEqual([
      "validate",
      "search_sources",
      "generate_company_brain",
      "save_memory",
      "update_context",
      "complete",
    ]);
  });
});
