export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;
export type BusinessOpportunityId = string;
export type OpportunityCategoryId = string;
export type OpportunityImpactId = string;
export type OpportunityROIId = string;
export type OpportunityRiskId = string;
export type OpportunityPriorityId = string;
export type OpportunityExecutionPlanId = string;
export type OpportunityEvidenceId = string;
export type OpportunityRecommendationId = string;

export type OpportunityCategoryKey =
  | "revenue_growth"
  | "cost_reduction"
  | "automation"
  | "customer_experience"
  | "marketing"
  | "sales"
  | "operations"
  | "finance"
  | "technology"
  | "innovation"
  | "digital_transformation"
  | "software_opportunity";

export type OpportunityType =
  | "create_software"
  | "create_app"
  | "automate_process"
  | "switch_supplier"
  | "reduce_costs"
  | "create_campaign"
  | "new_product"
  | "new_service"
  | "new_sales_channel"
  | "new_integration"
  | "new_dashboard";

export type OpportunityStatus =
  | "detected"
  | "updated"
  | "approved"
  | "rejected"
  | "executed"
  | "archived";

export type OpportunityPriorityLevel = "low" | "medium" | "high" | "critical" | "strategic";

export type OpportunityRiskLevel = "low" | "medium" | "high" | "critical";

export type RecommendedAction = {
  id: string;
  label: string;
  department?: string;
  order: number;
};

export const OPPORTUNITY_CATEGORIES: readonly {
  key: OpportunityCategoryKey;
  label: string;
}[] = [
  { key: "revenue_growth", label: "Revenue Growth" },
  { key: "cost_reduction", label: "Cost Reduction" },
  { key: "automation", label: "Automation" },
  { key: "customer_experience", label: "Customer Experience" },
  { key: "marketing", label: "Marketing" },
  { key: "sales", label: "Sales" },
  { key: "operations", label: "Operations" },
  { key: "finance", label: "Finance" },
  { key: "technology", label: "Technology" },
  { key: "innovation", label: "Innovation" },
  { key: "digital_transformation", label: "Digital Transformation" },
  { key: "software_opportunity", label: "Software Opportunity" },
] as const;

export const OPPORTUNITY_TYPES: readonly { key: OpportunityType; label: string }[] = [
  { key: "create_software", label: "Criar novo software" },
  { key: "create_app", label: "Criar aplicativo" },
  { key: "automate_process", label: "Automatizar processo" },
  { key: "switch_supplier", label: "Trocar fornecedor" },
  { key: "reduce_costs", label: "Reduzir custos" },
  { key: "create_campaign", label: "Criar campanha" },
  { key: "new_product", label: "Novo produto" },
  { key: "new_service", label: "Novo serviço" },
  { key: "new_sales_channel", label: "Novo canal de vendas" },
  { key: "new_integration", label: "Nova integração" },
  { key: "new_dashboard", label: "Novo dashboard" },
] as const;
