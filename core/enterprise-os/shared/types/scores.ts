export type Score = number;

export type HealthScore = {
  value: Score;
  status: "critical" | "degraded" | "healthy" | "optimal";
};

export type CapabilityScore = {
  value: Score;
  maturity: "initial" | "developing" | "defined" | "managed" | "optimized";
};
