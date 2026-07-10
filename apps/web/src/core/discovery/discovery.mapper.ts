import type { CompanyBrainSnapshot } from "../orchestrator/orchestrator.types";
import type { ClassifiedDiscoveryData, DiscoveryResult, ValidatedDiscoveryInput } from "./discovery.types";

export function mapToCompanyBrainSnapshot(
  input: ValidatedDiscoveryInput,
  data: ClassifiedDiscoveryData,
  brainId: string,
): CompanyBrainSnapshot {
  const health = {
    brand: data.strengths.length >= 2 ? 62 : 48,
    sales: 45,
    digital: data.website ? 52 : 35,
    operations: 72,
    financial: 65,
  };

  const growthScore = Math.round(
    Object.values(health).reduce((sum, v) => sum + v, 0) / Object.keys(health).length * 10,
  );

  return {
    tenantId: input.tenantId,
    companyId: input.companyId,
    companyName: data.company,
    growthScore,
    health,
    profile: {
      id: brainId,
      website: data.website,
      industry: data.industry,
      services: data.services,
      products: data.products,
      location: data.location,
      socialNetworks: data.socialNetworks,
      competitors: data.competitors,
      discoveryConfidence: data.confidence,
      sourcesUsed: data.sourcesUsed,
    },
    generatedAt: new Date().toISOString(),
  };
}

export function mapToDiscoveryResult(params: {
  input: ValidatedDiscoveryInput;
  data: ClassifiedDiscoveryData;
  brainId: string;
  executiveSummary: string;
  nextSteps: string[];
  pipeline: DiscoveryResult["pipeline"];
  memoriesCreated: number;
  contextFragmentCount: number;
  totalDurationMs: number;
}): DiscoveryResult {
  const { data } = params;

  return {
    id: `discovery-${Date.now()}`,
    company: data.company,
    website: data.website,
    industry: data.industry,
    services: data.services,
    products: data.products,
    location: data.location,
    socialNetworks: data.socialNetworks,
    competitors: data.competitors,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    opportunities: data.opportunities,
    risks: data.risks,
    confidence: data.confidence,
    missingInformation: data.missingInformation,
    executiveSummary: params.executiveSummary,
    nextSteps: params.nextSteps,
    pipeline: params.pipeline,
    companyBrainId: params.brainId,
    memoriesCreated: params.memoriesCreated,
    contextFragmentCount: params.contextFragmentCount,
    totalDurationMs: params.totalDurationMs,
    generatedAt: new Date().toISOString(),
  };
}

export function buildMemoryRecords(
  input: ValidatedDiscoveryInput,
  data: ClassifiedDiscoveryData,
  executiveSummary: string,
): import("../memory/memory.types").MemoryInput[] {
  return [
    {
      tenantId: input.tenantId,
      companyId: input.companyId,
      title: `Discovery — ${data.company}`,
      content: executiveSummary,
      memoryType: "DISCOVERY",
      importance: "HIGH",
      tags: ["discovery", "company-brain"],
      createdBy: input.userId,
    },
    {
      tenantId: input.tenantId,
      companyId: input.companyId,
      title: "SWOT — Discovery",
      content: [
        ...data.strengths.map((s) => `Força: ${s.title}`),
        ...data.weaknesses.map((w) => `Fraqueza: ${w.title}`),
      ].join("; "),
      memoryType: "ASSESSMENT",
      importance: "MEDIUM",
      tags: ["swot", "discovery"],
      createdBy: input.userId,
    },
  ];
}
