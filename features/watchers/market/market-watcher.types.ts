export type MarketSeverity = "Critical" | "High" | "Medium" | "Low";

export type MarketSignalType =
  | "new_competitor"
  | "price_change"
  | "new_product"
  | "market_trend"
  | "consumer_behavior"
  | "growth_opportunity"
  | "competitive_threat"
  | "sector_movement"
  | "regulatory_change"
  | "new_technology";

export type MarketSignal = {
  id: string;
  type: MarketSignalType;
  title: string;
  description: string;
  severity: MarketSeverity;
  confidence: number;
  source: string;
  detectedAt: string;
  metric?: string;
  value?: number;
  threshold?: number;
};

export type MarketRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: MarketSeverity;
  responsibleArea: string;
};

export type MarketAlert = {
  id: string;
  title: string;
  description: string;
  severity: MarketSeverity;
  source: string;
  expectedImpact: string;
  recommendation: MarketRecommendation;
  responsibleArea: string;
  confidence: number;
  status: "active" | "resolved" | "dismissed";
  createdAt: string;
};

export type MarketOpportunity = {
  id: string;
  title: string;
  description: string;
  severity: MarketSeverity;
  confidence: number;
  growthPotential: string;
  source: string;
};

export type MarketThreat = {
  id: string;
  title: string;
  description: string;
  severity: MarketSeverity;
  confidence: number;
  impact: string;
  source: string;
};

export type MarketTrend = {
  id: string;
  title: string;
  description: string;
  direction: "up" | "down" | "stable";
  severity: MarketSeverity;
  confidence: number;
  source: string;
};

export type CompetitiveMovement = {
  id: string;
  competitor: string;
  movement: string;
  description: string;
  severity: MarketSeverity;
  confidence: number;
  detectedAt: string;
};

export type MarketWatcherInput = {
  companyId?: string;
  companyName?: string;
  industry?: string;
};

export type MarketWatcherResult = {
  signals: MarketSignal[];
  alerts: MarketAlert[];
  opportunities: MarketOpportunity[];
  threats: MarketThreat[];
  trends: MarketTrend[];
  competitiveMovements: CompetitiveMovement[];
  newCompetitors: CompetitiveMovement[];
  recommendations: MarketRecommendation[];
  averageConfidence: number;
  executiveSummary: string;
  evaluatedAt: string;
};
