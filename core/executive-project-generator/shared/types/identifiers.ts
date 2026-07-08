export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;

export type ExecutiveProjectId = string;
export type ProjectOpportunityId = string;
export type ProjectProposalId = string;
export type ProjectBusinessCaseId = string;
export type ProjectROIId = string;
export type ProjectRoadmapId = string;
export type ProjectMilestoneId = string;
export type ProjectTaskId = string;
export type ProjectDependencyId = string;
export type ProjectApprovalId = string;

export type ProjectCategoryKey =
  | "automation"
  | "software"
  | "mobile_app"
  | "website"
  | "marketing"
  | "sales"
  | "finance"
  | "operations"
  | "customer_experience"
  | "digital_transformation"
  | "artificial_intelligence"
  | "training"
  | "infrastructure";

export type ProjectType =
  | "create_website"
  | "create_app"
  | "create_customer_portal"
  | "create_internal_system"
  | "create_executive_dashboard"
  | "create_automations"
  | "create_crm"
  | "create_loyalty_program"
  | "create_scheduling_system"
  | "create_ecommerce"
  | "create_integration"
  | "create_virtual_assistant";

export type ProjectPriorityLevel = "low" | "medium" | "high" | "critical" | "strategic";
export type ProjectRiskLevel = "low" | "medium" | "high" | "critical";
export type ProjectStatus = "generated" | "approved" | "rejected" | "started" | "paused" | "completed" | "archived";

export const PROJECT_CATEGORIES: readonly { key: ProjectCategoryKey; label: string }[] = [
  { key: "automation", label: "Automation" },
  { key: "software", label: "Software" },
  { key: "mobile_app", label: "Mobile App" },
  { key: "website", label: "Website" },
  { key: "marketing", label: "Marketing" },
  { key: "sales", label: "Sales" },
  { key: "finance", label: "Finance" },
  { key: "operations", label: "Operations" },
  { key: "customer_experience", label: "Customer Experience" },
  { key: "digital_transformation", label: "Digital Transformation" },
  { key: "artificial_intelligence", label: "Artificial Intelligence" },
  { key: "training", label: "Training" },
  { key: "infrastructure", label: "Infrastructure" },
] as const;

export const PROJECT_TYPES: readonly { key: ProjectType; label: string }[] = [
  { key: "create_website", label: "Criar Website" },
  { key: "create_app", label: "Criar Aplicativo" },
  { key: "create_customer_portal", label: "Criar Portal do Cliente" },
  { key: "create_internal_system", label: "Criar Sistema Interno" },
  { key: "create_executive_dashboard", label: "Criar Dashboard Executivo" },
  { key: "create_automations", label: "Criar Automações" },
  { key: "create_crm", label: "Criar CRM" },
  { key: "create_loyalty_program", label: "Criar Programa de Fidelidade" },
  { key: "create_scheduling_system", label: "Criar Sistema de Agendamento" },
  { key: "create_ecommerce", label: "Criar E-commerce" },
  { key: "create_integration", label: "Criar Integração" },
  { key: "create_virtual_assistant", label: "Criar Assistente Virtual" },
] as const;

