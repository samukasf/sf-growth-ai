export type Score = number;

export type HealthScore = {
  value: Score;
  label: "critical" | "at_risk" | "stable" | "healthy" | "excellent";
};

export type LeadScore = {
  value: Score;
  tier: "cold" | "warm" | "hot" | "qualified";
};

export type SupplierScore = {
  value: Score;
  reliability: "low" | "medium" | "high";
};

export type RelationshipScores = {
  satisfaction: Score;
  relationship: Score;
  risk: Score;
  lifetimeValue: number;
};
