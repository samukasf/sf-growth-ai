export type Score = number;

export type PricingScore = {
  value: Score;
  competitiveness: "low" | "medium" | "high";
};

export type QuoteScore = {
  value: Score;
  rank: number;
};
