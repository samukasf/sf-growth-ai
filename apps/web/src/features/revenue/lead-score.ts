import type { ExplainableLeadScore, LeadScoreComponents } from "./revenue.types";

const WEIGHTS: Record<keyof LeadScoreComponents, number> = {
  icpFit: 22,
  apparentNeed: 16,
  buyingCapacity: 12,
  intentSignals: 14,
  digitalOpportunity: 12,
  solutionGap: 8,
  recentActivity: 8,
  contactability: 8,
};

const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function calculateLeadScore(
  components: LeadScoreComponents,
  context?: { problemDetected?: string | null; recommendedOffer?: string | null; bestChannel?: string | null },
): ExplainableLeadScore {
  const normalized = Object.fromEntries(
    Object.entries(components).map(([key, value]) => [key, clamp(value)]),
  ) as LeadScoreComponents;

  const score = Math.round(
    (Object.keys(WEIGHTS) as Array<keyof LeadScoreComponents>).reduce(
      (total, key) => total + normalized[key] * WEIGHTS[key], 0,
    ),
  );

  const ranked = (Object.keys(WEIGHTS) as Array<keyof LeadScoreComponents>)
    .map((key) => ({ key, contribution: normalized[key] * WEIGHTS[key], value: normalized[key] }))
    .sort((a, b) => b.contribution - a.contribution);

  const explanation = ranked.slice(0, 3).map(({ key, value }) => `${key}: ${Math.round(value * 100)}%`);
  const nextBestAction = score >= 75
    ? "Preparar abordagem personalizada para aprovação"
    : score >= 50
      ? "Enriquecer dados e validar decisor antes do contacto"
      : "Manter no radar; não iniciar outreach ainda";

  return {
    score,
    components: normalized,
    explanation,
    problemDetected: context?.problemDetected ?? null,
    recommendedOffer: context?.recommendedOffer ?? null,
    bestChannel: context?.bestChannel ?? null,
    nextBestAction,
  };
}
