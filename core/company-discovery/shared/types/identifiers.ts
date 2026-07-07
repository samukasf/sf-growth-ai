export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;
export type DiscoverySessionId = string;
export type DiscoverySourceId = string;
export type DiscoveryFindingId = string;
export type DiscoveryGapId = string;
export type DiscoveryOpportunityId = string;
export type CompanyProfileId = string;
export type DiscoveryQuestionnaireId = string;
export type DiscoveryScoreId = string;

export type DiscoverySourceType =
  | "website"
  | "google_business"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "crm"
  | "erp"
  | "documents"
  | "employees"
  | "questionnaires"
  | "interviews"
  | "uploaded_files";

export type DiscoverySessionStatus =
  | "pending"
  | "collecting"
  | "analyzing"
  | "profiling"
  | "reporting"
  | "completed"
  | "failed";

export type DiscoverySourceStatus = "pending" | "collecting" | "completed" | "failed" | "skipped";

export type DiscoveryFindingCategory =
  | "identity"
  | "products"
  | "customers"
  | "operations"
  | "finance"
  | "marketing"
  | "sales"
  | "technology"
  | "people"
  | "processes"
  | "market"
  | "other";

export type DiscoveryGapSeverity = "low" | "medium" | "high" | "critical";

export type DiscoveryOpportunityPriority = "low" | "medium" | "high" | "strategic";
