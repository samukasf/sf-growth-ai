export type HealthStatus = "Critical" | "Weak" | "Stable" | "Healthy" | "Excellent";

export type HealthDimension =
  | "overall"
  | "marketing"
  | "sales"
  | "financial"
  | "operations"
  | "technology"
  | "people"
  | "digital_presence"
  | "brand"
  | "customer_experience"
  | "automation"
  | "ai_maturity";

export type HealthEvidence = {
  id: string;
  source: "discovery" | "company-brain" | "timeline" | "knowledge-graph";
  label: string;
  detail: string;
  weight: number;
};

export type HealthRecommendation = {
  id: string;
  dimension: HealthDimension;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
};

export type HealthScore = {
  dimension: HealthDimension;
  value: number;
  previousValue: number | null;
  variation: number | null;
  status: HealthStatus;
  confidence: number;
  updatedAt: string;
  incomplete: boolean;
  evidence: HealthEvidence[];
  recommendations: HealthRecommendation[];
};

export type HealthTrend = {
  dimension: HealthDimension;
  direction: "up" | "down" | "flat";
  delta: number;
  periodLabel: string;
};

export type CompanyHealth = {
  id: string;
  tenantId: string;
  companyId: string;
  companyName: string;
  segment: string;
  overall: HealthScore;
  dimensions: HealthScore[];
  calculatedAt: string;
  topFactors: string[];
  criticalDimensions: HealthDimension[];
};

export type HealthWeightConfig = Partial<Record<Exclude<HealthDimension, "overall">, number>>;

export type HealthCalculationContext = {
  brain: import("../company-brain.types").CompanyBrain;
  discovery?: import("../company-brain.types").DiscoveryResult;
  timelineEventCount?: number;
  timelineHighlights?: string[];
  knowledgeNodeCount?: number;
  knowledgeRelationCount?: number;
  knowledgeHighlights?: string[];
};

export type HealthComparison = {
  current: CompanyHealth;
  previous: CompanyHealth | null;
  improved: HealthDimension[];
  declined: HealthDimension[];
  unchanged: HealthDimension[];
};

export type HealthPresentation = {
  overall: {
    value: number;
    status: HealthStatus;
    confidence: number;
    variation: number | null;
    label: string;
  };
  dimensions: Array<{
    dimension: HealthDimension;
    label: string;
    value: number;
    previousValue: number | null;
    variation: number | null;
    status: HealthStatus;
    confidence: number;
    incomplete: boolean;
    topEvidence: string[];
  }>;
  topFactors: string[];
  criticalDimensions: Array<{ dimension: HealthDimension; label: string; value: number }>;
  recommendations: HealthRecommendation[];
  trends: HealthTrend[];
};

export const HEALTH_DIMENSION_LABELS: Record<HealthDimension, string> = {
  overall: "Overall Score",
  marketing: "Marketing Score",
  sales: "Sales Score",
  financial: "Financial Score",
  operations: "Operations Score",
  technology: "Technology Score",
  people: "People Score",
  digital_presence: "Digital Presence Score",
  brand: "Brand Score",
  customer_experience: "Customer Experience Score",
  automation: "Automation Score",
  ai_maturity: "AI Maturity Score",
};

export const HEALTH_DIMENSIONS: Exclude<HealthDimension, "overall">[] = [
  "marketing",
  "sales",
  "financial",
  "operations",
  "technology",
  "people",
  "digital_presence",
  "brand",
  "customer_experience",
  "automation",
  "ai_maturity",
];

export const MIN_HEALTH_SCORE = 0;
export const MAX_HEALTH_SCORE = 1000;
