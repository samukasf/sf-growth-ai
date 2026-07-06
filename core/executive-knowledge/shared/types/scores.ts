export type Score = number;

export const MIN_SCORE = 0;
export const MAX_SCORE = 100;

export function clampScore(value: number): Score {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(value)));
}
