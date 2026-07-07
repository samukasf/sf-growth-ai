export type Score = number;

export function clampScore(value: number): Score {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function weightedAverage(
  items: Array<{ score: number; weight: number }>,
): Score {
  if (items.length === 0) return 0;
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = items.reduce((sum, item) => sum + item.score * item.weight, 0);
  return clampScore(weighted / totalWeight);
}
