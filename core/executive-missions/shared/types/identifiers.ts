export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;

export type ExecutiveMissionId = string;
export type MissionCategoryId = string;
export type MissionObjectiveId = string;
export type MissionExecutionId = string;
export type MissionResultId = string;
export type MissionAlertId = string;
export type MissionRecommendationId = string;
export type MissionScheduleId = string;
export type MissionPriorityId = string;

export type MissionCategoryKey =
  | "revenue_growth"
  | "cost_reduction"
  | "customer_success"
  | "marketing_performance"
  | "sales_performance"
  | "financial_health"
  | "operational_excellence"
  | "digital_transformation"
  | "automation"
  | "innovation"
  | "risk_management"
  | "supplier_optimization"
  | "people_development"
  | "compliance"
  | "software_opportunities";

export type MissionPriorityLevel = "low" | "medium" | "high" | "critical" | "strategic";

export type MissionStatusKey =
  | "created"
  | "scheduled"
  | "running"
  | "completed"
  | "failed"
  | "paused"
  | "archived";

export type MissionFrequency =
  | "continuous"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "on_demand";

export const MISSION_CATEGORIES: readonly { key: MissionCategoryKey; label: string }[] = [
  { key: "revenue_growth", label: "Revenue Growth" },
  { key: "cost_reduction", label: "Cost Reduction" },
  { key: "customer_success", label: "Customer Success" },
  { key: "marketing_performance", label: "Marketing Performance" },
  { key: "sales_performance", label: "Sales Performance" },
  { key: "financial_health", label: "Financial Health" },
  { key: "operational_excellence", label: "Operational Excellence" },
  { key: "digital_transformation", label: "Digital Transformation" },
  { key: "automation", label: "Automation" },
  { key: "innovation", label: "Innovation" },
  { key: "risk_management", label: "Risk Management" },
  { key: "supplier_optimization", label: "Supplier Optimization" },
  { key: "people_development", label: "People Development" },
  { key: "compliance", label: "Compliance" },
  { key: "software_opportunities", label: "Software Opportunities" },
] as const;

