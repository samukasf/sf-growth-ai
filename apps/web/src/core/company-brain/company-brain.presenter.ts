import type { CompanyBrain, CompanyBrainSummary, CompanyBrainScores } from "./company-brain.types";

export function formatConfidence(value: number): string {
  return `${value}%`;
}

export function formatScore(value: number): string {
  return `${value}/100`;
}

export interface CompanyBrainViewModel {
  headline: string;
  executiveSummary: string;
  confidenceLabel: string;
  scores: Array<{ key: keyof CompanyBrainScores; label: string; value: number; formatted: string }>;
  swotSections: Array<{
    key: string;
    title: string;
    accent: string;
    items: Array<{ id: string; title: string; description: string }>;
  }>;
  timeline: Array<{ id: string; title: string; description: string; occurredAt: string; type: string }>;
  recommendations: string[];
  statusAreas: Array<{ label: string; score: number; summary: string }>;
}

export function presentCompanyBrain(
  brain: CompanyBrain,
  summary: CompanyBrainSummary,
): CompanyBrainViewModel {
  return {
    headline: summary.headline,
    executiveSummary: summary.executiveSummary,
    confidenceLabel: formatConfidence(brain.confidenceScore),
    scores: [
      { key: "knowledgeScore", label: "Knowledge Score", value: brain.knowledgeScore, formatted: formatScore(brain.knowledgeScore) },
      { key: "completenessScore", label: "Completeness Score", value: brain.completenessScore, formatted: formatScore(brain.completenessScore) },
      { key: "confidenceScore", label: "Confidence Score", value: brain.confidenceScore, formatted: formatScore(brain.confidenceScore) },
    ],
    swotSections: [
      { key: "strengths", title: "Strengths", accent: "text-emerald-300", items: brain.swot.strengths },
      { key: "weaknesses", title: "Weaknesses", accent: "text-amber-300", items: brain.swot.weaknesses },
      { key: "opportunities", title: "Opportunities", accent: "text-blue-300", items: brain.swot.opportunities },
      { key: "risks", title: "Risks", accent: "text-red-300", items: brain.swot.risks },
    ],
    timeline: brain.timeline.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      occurredAt: event.occurredAt,
      type: event.type,
    })),
    recommendations: brain.recommendations,
    statusAreas: [
      brain.marketingStatus,
      brain.financialStatus,
      brain.operationalStatus,
      brain.digitalPresence,
    ],
  };
}
