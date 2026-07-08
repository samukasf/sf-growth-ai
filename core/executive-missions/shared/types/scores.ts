export type Score = number;

export function clampScore(value: number): Score {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function clampMoney(value: number): number {
  return Math.max(0, Math.round(value));
}

