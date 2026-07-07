export type Score = number;

export type ConfidenceScore = {
  value: Score;
  factors: string[];
};

export function clampScore(value: number): Score {
  return Math.max(0, Math.min(100, Math.round(value)));
}
