export type BrainSnapshotId = string;
export type BrainContextId = string;
export type BrainSignalId = string;
export type BrainRelationshipId = string;
export type BrainStateId = string;
export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;

export type BrainSignalType = "risk" | "opportunity" | "priority" | "alert" | "insight";

export type BrainStatePhase = "initializing" | "active" | "degraded" | "syncing" | "ready";

export type DataSourceKey =
  | "enterprise_memory"
  | "executive_knowledge"
  | "executive_learning"
  | "executive_experience"
  | "executive_wisdom"
  | "organization"
  | "company"
  | "departments"
  | "projects"
  | "crm"
  | "communication"
  | "automation"
  | "commerce"
  | "scheduling";
