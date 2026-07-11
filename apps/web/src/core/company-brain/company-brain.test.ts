import { describe, expect, it } from "vitest";
import { buildCompanyBrain } from "./company-brain.builder";
import { createSampleDiscoveryResult } from "./company-brain.fixture";
import { presentCompanyBrain } from "./company-brain.presenter";
import { InMemoryCompanyBrainRepository } from "./company-brain.repository";
import { CompanyBrainService } from "./company-brain.service";
import { validateCompanyBrain } from "./company-brain.validator";

describe("CompanyBrainBuilder", () => {
  it("builds structured knowledge from discovery", () => {
    const discovery = createSampleDiscoveryResult();
    const brain = buildCompanyBrain(discovery);

    expect(brain.companyName).toBe("Acme Growth Labs");
    expect(brain.mission).toContain("crescimento");
    expect(brain.products).toContain("Growth OS");
    expect(brain.services.length).toBeGreaterThan(0);
    expect(brain.swot.strengths.length).toBeGreaterThan(0);
    expect(brain.knowledgeScore).toBeGreaterThan(0);
    expect(brain.completenessScore).toBeGreaterThan(0);
    expect(brain.confidenceScore).toBeGreaterThan(0);
    expect(brain.timeline.length).toBeGreaterThan(0);
  });

  it("validates, summarizes and scores through service", async () => {
    const discovery = createSampleDiscoveryResult();
    const service = new CompanyBrainService(new InMemoryCompanyBrainRepository());
    const brain = await service.build({ discovery });

    const validation = service.validate(brain);
    expect(validation.valid).toBe(true);

    const summary = service.summarize(brain, discovery);
    expect(summary.headline).toContain("Acme Growth Labs");

    const scores = service.calculateScore(brain, discovery);
    expect(scores.knowledgeScore).toBe(brain.knowledgeScore);

    const presentation = presentCompanyBrain(brain, discovery);
    expect(presentation.recommendations.length).toBeGreaterThan(0);
  });

  it("updates an existing brain from a new discovery", async () => {
    const discovery = createSampleDiscoveryResult();
    const service = new CompanyBrainService(new InMemoryCompanyBrainRepository());
    const brain = await service.build({ discovery });

    const updated = await service.update({
      brainId: brain.id,
      patch: {
        mission: "Nova missão estratégica",
      },
    });

    expect(updated.id).toBe(brain.id);
    expect(updated.mission).toBe("Nova missão estratégica");
    expect(validateCompanyBrain(updated).valid).toBe(true);
  });
});
