import type {
  CompanyBrain,
  CompanyBrainPresentation,
  DiscoveryResult,
} from "./company-brain.types";
import type { KnowledgeGraphPresentation } from "./knowledge/knowledge.types";
import { summarizeCompanyBrain } from "./company-brain.summary";

export function presentCompanyBrain(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
  knowledge?: KnowledgeGraphPresentation,
): CompanyBrainPresentation {
  return {
    executiveSummary: summarizeCompanyBrain(brain, discovery),
    swot: brain.swot,
    scores: {
      knowledgeScore: brain.knowledgeScore,
      completenessScore: brain.completenessScore,
      confidenceScore: brain.confidenceScore,
    },
    timeline: brain.timeline,
    recommendations: [
      ...discovery?.report.nextSteps ?? [],
      ...brain.growthOpportunities.slice(0, 3),
      ...brain.openRisks.slice(0, 2).map((risk) => `Endereçar risco: ${risk}`),
    ].slice(0, 8),
    knowledge,
  };
}
