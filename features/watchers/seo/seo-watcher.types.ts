import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { SearchConsoleExecutive } from "@/features/search-console/services/search-console-executive.service";

export type SeoSeverity = "Critical" | "High" | "Medium" | "Low";

export type SeoSignalType =
  | "clicks_drop"
  | "impressions_drop"
  | "ctr_drop"
  | "position_loss"
  | "indexing_issue"
  | "core_web_vitals"
  | "keyword_opportunity"
  | "page_growth_potential"
  | "page_at_risk"
  | "competitor_position_gain";

export type SeoSignal = {
  id: string;
  type: SeoSignalType;
  title: string;
  description: string;
  severity: SeoSeverity;
  confidence: number;
  source: string;
  detectedAt: string;
  metric?: string;
  value?: number;
  threshold?: number;
};

export type SeoRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: SeoSeverity;
  responsibleArea: string;
};

export type SeoAlert = {
  id: string;
  title: string;
  description: string;
  severity: SeoSeverity;
  source: string;
  expectedImpact: string;
  recommendation: SeoRecommendation;
  responsibleArea: string;
  confidence: number;
  status: "active" | "resolved" | "dismissed";
  createdAt: string;
};

export type SeoOpportunity = {
  id: string;
  title: string;
  description: string;
  severity: SeoSeverity;
  confidence: number;
  growthPotential: string;
  source: string;
  query?: string;
  page?: string;
};

export type SeoRisk = {
  id: string;
  title: string;
  description: string;
  severity: SeoSeverity;
  confidence: number;
  impact: string;
  source: string;
  page?: string;
};

export type SeoMetricsSnapshot = {
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  seoHealthScore: number;
  organicTrafficScore: number;
  coreWebVitalsScore: number;
  ctrScore: number;
};

export type GrowingKeyword = {
  id: string;
  query: string;
  clicks: number;
  impressions: number;
  position: number;
  growthPercent: number;
};

export type SeoWatcherInput = {
  companyId?: string;
  companyName?: string;
  searchConsoleExecutive?: SearchConsoleExecutive | null;
  marketingExecutive?: MarketingExecutive | null;
};

export type SeoWatcherResult = {
  signals: SeoSignal[];
  alerts: SeoAlert[];
  opportunities: SeoOpportunity[];
  risks: SeoRisk[];
  recommendations: SeoRecommendation[];
  metrics: SeoMetricsSnapshot;
  growingKeywords: GrowingKeyword[];
  pagesAtRisk: SeoRisk[];
  averageConfidence: number;
  executiveSummary: string;
  dataSource: "google-search-console" | "mock";
  evaluatedAt: string;
};
