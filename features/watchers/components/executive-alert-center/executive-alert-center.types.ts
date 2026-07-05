export type ExecutiveAlertSeverity = "Critical" | "High" | "Medium" | "Low";

export type ExecutiveAlertStatus = "active" | "resolved" | "dismissed" | "delegated" | "agenda";

export type ExecutiveAlertOrigin =
  | "market-watcher"
  | "seo-watcher"
  | "watcher-core"
  | "google-business"
  | "meta"
  | "crm"
  | "marketing"
  | "finance"
  | "sales"
  | "operations"
  | "hr"
  | "legal"
  | "monitoring";

export type ExecutiveAlertFilter =
  | "all"
  | "critical"
  | "today"
  | "this-week"
  | "marketing"
  | "finance"
  | "operations"
  | "seo"
  | "market";

export type ConsolidatedExecutiveAlert = {
  id: string;
  title: string;
  description: string;
  origin: ExecutiveAlertOrigin;
  originLabel: string;
  severity: ExecutiveAlertSeverity;
  timestamp: string;
  impact: string;
  recommendation: string;
  responsible: string;
  confidence: number;
  status: ExecutiveAlertStatus;
  filterCategory: ExecutiveAlertFilter | "all";
};

export type ExecutiveAlertCenterSummary = {
  criticalCount: number;
  resolvedCount: number;
  newCount: number;
  riskScore: number;
  totalAlerts: number;
};

export type ExecutiveAlertCenterState = {
  alerts: ConsolidatedExecutiveAlert[];
  summary: ExecutiveAlertCenterSummary;
};
