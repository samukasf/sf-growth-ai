import type { CompanyBrain, CompanyBrainScores, DiscoveryResult } from "./company-brain.types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateKnowledgeScore(brain: CompanyBrain): number {
  const sections = [
    brain.mission,
    brain.vision,
    brain.values.length > 0,
    brain.products.length > 0,
    brain.services.length > 0,
    brain.targetAudience.length > 0,
    brain.competitors.length > 0,
    brain.businessGoals.length > 0,
    brain.swot.strengths.length > 0,
    brain.swot.weaknesses.length > 0,
    brain.swot.opportunities.length > 0,
    brain.swot.threats.length > 0,
  ];

  const filled = sections.filter(Boolean).length;
  return clampScore((filled / sections.length) * 100);
}

export function calculateCompletenessScore(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): number {
  const profileScore = discovery?.profile.completenessScore ?? brain.companyProfile.completenessScore;
  const domainScores = [
    brain.marketingStatus.score,
    brain.financialStatus.score,
    brain.operationalStatus.score,
    brain.digitalPresence.score,
  ];

  return clampScore(average([profileScore, ...domainScores]));
}

export function calculateConfidenceScore(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): number {
  const sectionConfidences =
    discovery?.profile.sections.map((section) => section.confidence) ??
    [];

  const domainScores = [
    brain.marketingStatus.score,
    brain.financialStatus.score,
    brain.operationalStatus.score,
    brain.digitalPresence.score,
  ];

  const discoveryOverall = discovery?.report.score.overallScore;
  const values = [
    ...sectionConfidences,
    ...domainScores,
    ...(discoveryOverall !== undefined ? [discoveryOverall] : []),
  ];

  return clampScore(average(values));
}

export function calculateScores(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): CompanyBrainScores {
  return {
    knowledgeScore: calculateKnowledgeScore(brain),
    completenessScore: calculateCompletenessScore(brain, discovery),
    confidenceScore: calculateConfidenceScore(brain, discovery),
  };
}

export function applyScores(
  brain: CompanyBrain,
  discovery?: DiscoveryResult,
): CompanyBrain {
  const scores = calculateScores(brain, discovery);
  return {
    ...brain,
    ...scores,
  };
}
