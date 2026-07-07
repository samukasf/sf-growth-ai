export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;
export type AssessmentId = string;
export type AssessmentCategoryId = string;
export type AssessmentQuestionId = string;
export type AssessmentAnswerId = string;
export type AssessmentScoreId = string;
export type AssessmentDimensionId = string;
export type AssessmentRecommendationId = string;
export type AssessmentRoadmapId = string;
export type AssessmentBenchmarkId = string;

export type AssessmentStatus =
  | "pending"
  | "in_progress"
  | "scoring"
  | "recommending"
  | "roadmapping"
  | "completed"
  | "failed";

export type AssessmentDimensionKey =
  | "estrategia"
  | "marketing"
  | "vendas"
  | "financeiro"
  | "operacoes"
  | "rh"
  | "tecnologia"
  | "automacao"
  | "experiencia_cliente"
  | "comunicacao"
  | "dados"
  | "inteligencia_artificial";

export type CompositeScoreKey =
  | "enterprise_maturity"
  | "business_health"
  | "automation"
  | "digital_maturity"
  | "ai_readiness"
  | "operational_efficiency"
  | "customer_experience";

export type RecommendationPriority = "low" | "medium" | "high" | "critical";

export type RoadmapHorizon = "30_days" | "90_days" | "180_days" | "365_days";

export const ASSESSMENT_DIMENSIONS: readonly {
  key: AssessmentDimensionKey;
  label: string;
  weight: number;
}[] = [
  { key: "estrategia", label: "Estratégia", weight: 1.0 },
  { key: "marketing", label: "Marketing", weight: 0.9 },
  { key: "vendas", label: "Vendas", weight: 1.0 },
  { key: "financeiro", label: "Financeiro", weight: 1.1 },
  { key: "operacoes", label: "Operações", weight: 1.1 },
  { key: "rh", label: "RH", weight: 0.8 },
  { key: "tecnologia", label: "Tecnologia", weight: 1.0 },
  { key: "automacao", label: "Automação", weight: 0.9 },
  { key: "experiencia_cliente", label: "Experiência do Cliente", weight: 1.0 },
  { key: "comunicacao", label: "Comunicação", weight: 0.8 },
  { key: "dados", label: "Dados", weight: 1.0 },
  { key: "inteligencia_artificial", label: "Inteligência Artificial", weight: 0.9 },
] as const;
