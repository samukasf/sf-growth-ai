export type Score = number;

export type OptimizationScore = {
  value: Score;
  label: "poor" | "fair" | "good" | "excellent";
};

export type AvailabilityScore = {
  value: Score;
  slotsAvailable: number;
};
