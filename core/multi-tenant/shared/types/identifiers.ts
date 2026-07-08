export type OrganizationId = string;
export type AgencyId = string;
export type TenantId = string;
export type TenantWorkspaceId = string;
export type TenantContextId = string;
export type TenantSettingsId = string;
export type TenantIdentityId = string;
export type TenantLimitsId = string;
export type TenantSubscriptionId = string;
export type TenantMetricsSnapshotId = string;
export type TenantHealthId = string;
export type CompanyId = string;
export type DomainEventId = string;

export type TenantStatus = "pending" | "active" | "suspended" | "archived" | "deleted";
export type TenantSubscriptionPlan = "starter" | "growth" | "enterprise" | "custom";
export type TenantSubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";
