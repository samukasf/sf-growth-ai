export type Score = number;

export type HealthScore = {
  value: Score;
  status: "unavailable" | "degraded" | "healthy" | "optimal";
};

export type CostScore = {
  amount: number;
  currency: string;
  perThousandTokens: number;
};
