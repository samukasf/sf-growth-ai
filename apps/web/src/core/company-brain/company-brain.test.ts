import { describe, expect, it } from "vitest";

import { runDiscovery } from "../discovery/discovery.service";
import { buildCompanyBrainFromDiscovery } from "./company-brain.builder";
import { createCompanyBrainRepository } from "./company-brain.repository";
import { calculateScore } from "./company-brain.score";
import { createCompanyBrainService } from "./company-brain.service";
import { summarizeCompanyBrain } from "./company-brain.summary";
import { validateCompanyBrain } from "./company-brain.validator";

describe("CompanyBrainService", () => {
  it("builds structured Company Brain from DiscoveryResult", async () => {
    const discovery = await runDiscovery({
      companyName: "GrafGil Impressões",
      website: "grafgil.com.br",
      instagram: "grafgil",
      city: "São Paulo",
    });

    const repository = createCompanyBrainRepository();
    const service = createCompanyBrainService(repository);
    const response = await service.build({ discoveryResult: discovery });

    const brain = response.companyBrain;

    expect(brain.profile.companyName).toBe("GrafGil Impressões");
    expect(brain.mission).toBeTruthy();
    expect(brain.vision).toBeTruthy();
    expect(brain.values.length).toBeGreaterThan(0);
    expect(brain.products.length).toBeGreaterThan(0);
    expect(brain.services.length).toBeGreaterThan(0);
    expect(brain.targetAudience.length).toBeGreaterThan(0);
    expect(brain.swot.strengths.length).toBeGreaterThan(0);
    expect(brain.marketingStatus.score).toBeGreaterThan(0);
    expect(brain.financialStatus.score).toBeGreaterThan(0);
    expect(brain.operationalStatus.score).toBeGreaterThan(0);
    expect(brain.digitalPresence.score).toBeGreaterThan(0);
    expect(brain.businessGoals.length).toBeGreaterThan(0);
    expect(brain.openRisks.length).toBeGreaterThan(0);
    expect(brain.growthOpportunities.length).toBeGreaterThan(0);
    expect(brain.timeline.length).toBeGreaterThanOrEqual(2);
    expect(brain.knowledgeScore).toBeGreaterThan(0);
    expect(brain.completenessScore).toBeGreaterThan(0);
    expect(brain.confidenceScore).toBe(discovery.confidence);
    expect(brain.recommendations.length).toBeGreaterThan(0);
    expect(response.validation.valid).toBe(true);
    expect(response.summary.executiveSummary).toBeTruthy();
  });

  it("updates existing Company Brain and recalculates scores", async () => {
    const discovery = await runDiscovery({ companyName: "Acme Corp", city: "Rio" });
    const repository = createCompanyBrainRepository();
    const service = createCompanyBrainService(repository);

    const built = await service.build({ discoveryResult: discovery });
    const updated = await service.update(built.companyBrain.id, {
      mission: "Nova missão estratégica",
      businessGoals: ["Expandir mercado", "Aumentar receita recorrente"],
    });

    expect(updated).not.toBeNull();
    expect(updated!.companyBrain.mission).toBe("Nova missão estratégica");
    expect(updated!.companyBrain.businessGoals).toHaveLength(2);
    expect(updated!.companyBrain.timeline.some((e) => e.type === "update")).toBe(true);
  });

  it("validates, summarizes and calculates scores", async () => {
    const discovery = await runDiscovery({ companyName: "Minimal Co" });
    const brain = buildCompanyBrainFromDiscovery({ discoveryResult: discovery });

    const validation = validateCompanyBrain(brain);
    const summary = summarizeCompanyBrain(brain);
    const scores = calculateScore(brain);

    expect(typeof validation.valid).toBe("boolean");
    expect(summary.highlights.length).toBeGreaterThan(0);
    expect(summary.missingAreas.length).toBeGreaterThan(0);
    expect(scores.knowledgeScore).toBeGreaterThan(0);
    expect(scores.completenessScore).toBeGreaterThan(0);
    expect(scores.confidenceScore).toBe(discovery.confidence);
  });
});
