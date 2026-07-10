import { describe, expect, it } from "vitest";

import { analyzeCompany } from "./company-analysis.service";

describe("CompanyAnalysisService", () => {
  it("runs full analysis pipeline for a company", async () => {
    const result = await analyzeCompany({ companyName: "GrafGil Impressões" });

    expect(result.companyName).toBe("GrafGil Impressões");
    expect(result.summary).toContain("GrafGil Impressões");
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.weaknesses.length).toBeGreaterThan(0);
    expect(result.opportunities.length).toBeGreaterThan(0);
    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.priorityActions.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.generatedAt).toBeTruthy();
  });

  it("includes mock decision data from story example", async () => {
    const result = await analyzeCompany({ companyName: "Acme Corp" });

    expect(result.strengths.some((s) => s.title === "Marca consistente")).toBe(true);
    expect(result.weaknesses.some((w) => w.title === "Pouca presença em SEO")).toBe(true);
    expect(result.opportunities.some((o) => o.title === "Campanhas Google")).toBe(true);
    expect(result.opportunities.some((o) => o.title === "Landing Pages")).toBe(true);
    expect(result.risks.some((r) => r.title === "Dependência de indicação")).toBe(true);
    expect(result.priorityActions[0].title).toBe("Criar campanha Google Ads");
  });

  it("includes pipeline steps through response builder", async () => {
    const result = await analyzeCompany({ companyName: "Test Co" });
    const stepNames = result.pipeline.map((step) => step.name);

    expect(stepNames).toContain("load_memory");
    expect(stepNames).toContain("load_company_brain");
    expect(stepNames).toContain("load_executive_council");
    expect(stepNames).toContain("load_decision");
    expect(stepNames).toContain("load_action_planner");
    expect(stepNames).toContain("build_response");

    for (const step of result.pipeline) {
      expect(step.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("rejects empty company name", async () => {
    await expect(analyzeCompany({ companyName: "  " })).rejects.toThrow(
      "companyName is required",
    );
  });
});
