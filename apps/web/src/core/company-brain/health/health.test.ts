import { describe, expect, it } from "vitest";

import { buildCompanyBrain } from "../company-brain.builder";
import { createSampleDiscoveryResult } from "../company-brain.fixture";
import { buildKnowledgeGraphFromCompanyBrain } from "../knowledge/knowledge.builder";
import { mapDiscoveryToTimelineEvents } from "../timeline/timeline.mapper";
import {
  classifyHealthStatus,
  clampHealthScore,
  CompanyHealthService,
  HealthCalculator,
  HealthRulesEngine,
  healthRulesEngine,
  InMemoryHealthRepository,
  scaleToHealthRange,
} from "./index";

describe("HealthRulesEngine", () => {
  const rules = new HealthRulesEngine();

  it("classifies status thresholds", () => {
    expect(classifyHealthStatus(250)).toBe("Critical");
    expect(classifyHealthStatus(450)).toBe("Weak");
    expect(classifyHealthStatus(600)).toBe("Stable");
    expect(classifyHealthStatus(750)).toBe("Healthy");
    expect(classifyHealthStatus(900)).toBe("Excellent");
  });

  it("clamps scores between 0 and 1000", () => {
    expect(clampHealthScore(-10)).toBe(0);
    expect(clampHealthScore(1500)).toBe(1000);
    expect(scaleToHealthRange(72)).toBe(720);
  });

  it("calculates weighted overall excluding incomplete dimensions", () => {
    const overall = rules.calculateWeightedOverall(
      [
        { dimension: "marketing", value: 800, incomplete: false },
        { dimension: "sales", value: 600, incomplete: false },
        { dimension: "people", value: 0, incomplete: true },
      ],
      healthRulesEngine.resolveWeights("SaaS B2B"),
    );

    expect(overall).toBeGreaterThan(0);
    expect(overall).toBeLessThanOrEqual(1000);
  });
});

describe("HealthCalculator", () => {
  it("marks incomplete dimensions as Weak with low confidence when evidence is missing", () => {
    const discovery = createSampleDiscoveryResult();
    const brain = buildCompanyBrain({
      ...discovery,
      profile: discovery.profile,
    });

    const calculator = new HealthCalculator();
    const result = calculator.calculate({
      brain: {
        ...brain,
        values: [],
        targetAudience: [],
      },
      discovery,
      knowledgeNodeCount: 0,
    });

    const people = result.dimensions.find((score) => score.dimension === "people");
    const customer = result.dimensions.find((score) => score.dimension === "customer_experience");

    expect(people?.incomplete).toBe(true);
    expect(people?.status).toBe("Weak");
    expect(people?.confidence).toBeLessThanOrEqual(35);
    expect(customer?.incomplete).toBe(true);
  });

  it("does not produce dimension scores without evidence", () => {
    const calculator = new HealthCalculator();
    const result = calculator.calculate({
      brain: buildCompanyBrain(createSampleDiscoveryResult()),
    });

    for (const score of result.dimensions) {
      if (!score.incomplete) {
        expect(score.evidence.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("CompanyHealthService", () => {
  it("calculates variation on recalculate", async () => {
    const discovery = createSampleDiscoveryResult();
    const brain = buildCompanyBrain(discovery);
    const timelineEvents = mapDiscoveryToTimelineEvents(discovery);
    const knowledgeGraph = buildKnowledgeGraphFromCompanyBrain(brain, discovery);
    const service = new CompanyHealthService(new InMemoryHealthRepository());

    const first = await service.recalculate({
      brain,
      discovery,
      timelineEvents,
      knowledgeGraph,
    });

    expect(first.overall.value).toBeGreaterThan(0);
    expect(first.overall.value).toBeLessThanOrEqual(1000);

    const second = await service.recalculate({
      brain: {
        ...brain,
        marketingStatus: { ...brain.marketingStatus, score: 95 },
        financialStatus: { ...brain.financialStatus, score: 90 },
      },
      discovery,
      timelineEvents,
      knowledgeGraph,
    });

    expect(second.overall.previousValue).toBe(first.overall.value);
    expect(second.overall.variation).not.toBeNull();

    const trends = await service.getTrends(brain.companyId);
    expect(trends.length).toBeGreaterThan(0);

    const critical = await service.getCriticalDimensions(brain.companyId);
    expect(Array.isArray(critical)).toBe(true);

    const recommendations = await service.getRecommendations(brain.companyId);
    expect(Array.isArray(recommendations)).toBe(true);
  });

  it("integrates discovery, timeline and knowledge graph context", async () => {
    const discovery = createSampleDiscoveryResult();
    const brain = buildCompanyBrain(discovery);
    const service = new CompanyHealthService(new InMemoryHealthRepository());

    const health = await service.recalculate({
      brain,
      discovery,
      timelineEvents: mapDiscoveryToTimelineEvents(discovery),
      knowledgeGraph: buildKnowledgeGraphFromCompanyBrain(brain, discovery),
    });

    expect(health.topFactors.length).toBeGreaterThan(0);
    expect(health.dimensions.some((score) => !score.incomplete)).toBe(true);
    expect(health.overall.evidence.length).toBeGreaterThan(0);

    const marketing = await service.getDimensionScore(brain.companyId, "marketing");
    expect(marketing?.dimension).toBe("marketing");
  });
});
