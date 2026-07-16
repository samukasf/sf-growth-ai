export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;

export type SoftwareProjectId = string;
export type SoftwareSpecificationId = string;
export type BusinessRequirementsId = string;
export type FunctionalRequirementsId = string;
export type TechnicalRequirementsId = string;
export type ArchitectureBlueprintId = string;
export type ApplicationModuleId = string;
export type GeneratedArtifactId = string;
export type DeploymentPlanId = string;
export type SoftwareApprovalId = string;

export type SoftwareProjectType =
  | "website"
  | "landing_page"
  | "crm"
  | "erp"
  | "dashboard"
  | "mobile_app"
  | "customer_portal"
  | "employee_portal"
  | "internal_system"
  | "api"
  | "microservice"
  | "automation";

export type SoftwarePriorityLevel = "low" | "medium" | "high" | "critical" | "strategic";
export type SoftwareApprovalStatus = "pending" | "approved" | "rejected";
export type ArtifactKind =
  | "source_blueprint"
  | "schema"
  | "api_contract"
  | "ui_map"
  | "automation_flow"
  | "navigable_preview"
  | "handoff_package";

export const SOFTWARE_PROJECT_TYPES: readonly { key: SoftwareProjectType; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "landing_page", label: "Landing Page" },
  { key: "crm", label: "CRM" },
  { key: "erp", label: "ERP" },
  { key: "dashboard", label: "Dashboard" },
  { key: "mobile_app", label: "Mobile App" },
  { key: "customer_portal", label: "Portal do Cliente" },
  { key: "employee_portal", label: "Portal do Funcionário" },
  { key: "internal_system", label: "Sistema Interno" },
  { key: "api", label: "API" },
  { key: "microservice", label: "Microservice" },
  { key: "automation", label: "Automation" },
] as const;
