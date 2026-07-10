import type { CompanyBrain, CompanyBrainScores } from "./company-brain.types";

const KNOWLEDGE_FIELDS: Array<(brain: CompanyBrain) => unknown> = [
  (b) => b.profile.companyName,
  (b) => b.profile.website,
  (b) => b.profile.industry,
  (b) => b.profile.location,
  (b) => b.mission,
  (b) => b.vision,
  (b) => b.values.length,
  (b) => b.products.length,
  (b) => b.services.length,
  (b) => b.targetAudience.length,
  (b) => b.competitors.length,
  (b) => b.swot.strengths.length,
  (b) => b.swot.weaknesses.length,
  (b) => b.swot.opportunities.length,
  (b) => b.swot.risks.length,
  (b) => b.businessGoals.length,
  (b) => b.openRisks.length,
  (b) => b.growthOpportunities.length,
];

const COMPLETENESS_WEIGHTS = {
  profile: 15,
  identity: 15,
  offerings: 15,
  market: 10,
  swot: 20,
  status: 15,
  goals: 10,
} as const;

function isPopulated(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateKnowledgeScore(brain: CompanyBrain): number {
  const filled = KNOWLEDGE_FIELDS.filter((getter) => isPopulated(getter(brain))).length;
  return clampScore((filled / KNOWLEDGE_FIELDS.length) * 100);
}

export function calculateCompletenessScore(brain: CompanyBrain): number {
  let score = 0;

  if (brain.profile.companyName && brain.profile.industry && brain.profile.location) {
    score += COMPLETENESS_WEIGHTS.profile;
  }

  if (brain.mission && brain.vision && brain.values.length >= 2) {
    score += COMPLETENESS_WEIGHTS.identity;
  }

  if (brain.products.length > 0 && brain.services.length > 0) {
    score += COMPLETENESS_WEIGHTS.offerings;
  }

  if (brain.targetAudience.length > 0 && brain.competitors.length > 0) {
    score += COMPLETENESS_WEIGHTS.market;
  }

  const swotCount =
    brain.swot.strengths.length +
    brain.swot.weaknesses.length +
    brain.swot.opportunities.length +
    brain.swot.risks.length;
  if (swotCount >= 4) {
    score += COMPLETENESS_WEIGHTS.swot;
  } else if (swotCount > 0) {
    score += COMPLETENESS_WEIGHTS.swot / 2;
  }

  const statusAverage =
    (brain.marketingStatus.score +
      brain.financialStatus.score +
      brain.operationalStatus.score +
      brain.digitalPresence.score) /
    4;
  if (statusAverage >= 40) {
    score += COMPLETENESS_WEIGHTS.status;
  }

  if (brain.businessGoals.length > 0 && brain.growthOpportunities.length > 0) {
    score += COMPLETENESS_WEIGHTS.goals;
  }

  return clampScore(score);
}

export function calculateConfidenceScore(brain: CompanyBrain): number {
  return clampScore(brain.confidenceScore);
}

export function calculateScore(brain: CompanyBrain): CompanyBrainScores {
  const knowledgeScore = calculateKnowledgeScore(brain);
  const completenessScore = calculateCompletenessScore(brain);
  const confidenceScore = calculateConfidenceScore(brain);

  return {
    knowledgeScore,
    completenessScore,
    confidenceScore,
  };
}

export function applyScores(brain: CompanyBrain): CompanyBrain {
  const scores = calculateScore(brain);
  return {
    ...brain,
    ...scores,
  };
}
