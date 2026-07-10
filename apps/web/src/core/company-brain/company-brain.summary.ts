import type { CompanyBrain, CompanyBrainSummary } from "./company-brain.types";
import { calculateScore } from "./company-brain.score";

export function summarizeCompanyBrain(brain: CompanyBrain): CompanyBrainSummary {
  const scoreOverview = calculateScore(brain);

  const highlights = [
    `${brain.profile.companyName} — ${brain.profile.industry}`,
    `${brain.services.length} serviços e ${brain.products.length} produtos mapeados`,
    `${brain.swot.strengths.length} forças e ${brain.growthOpportunities.length} oportunidades identificadas`,
  ];

  const missingAreas: string[] = [];

  if (!brain.profile.website) missingAreas.push("Website oficial");
  if (brain.targetAudience.length === 0) missingAreas.push("Público-alvo");
  if (brain.competitors.length === 0) missingAreas.push("Concorrentes");
  if (brain.businessGoals.length === 0) missingAreas.push("Metas de negócio");

  return {
    headline: `Company Brain — ${brain.profile.companyName}`,
    executiveSummary: brain.executiveSummary,
    highlights,
    missingAreas,
    scoreOverview,
  };
}
