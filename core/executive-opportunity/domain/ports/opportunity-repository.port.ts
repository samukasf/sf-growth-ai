import type {
  BusinessOpportunity,
  OpportunityEvidence,
  OpportunityExecutionPlan,
  OpportunityImpact,
  OpportunityPriority,
  OpportunityRecommendation,
  OpportunityROI,
  OpportunityRisk,
} from "../entities";
import type { BusinessOpportunityId, CompanyId, OrganizationId } from "../../shared";

export type OpportunityResult = {
  opportunity: ReturnType<BusinessOpportunity["toJSON"]>;
  roi: ReturnType<OpportunityROI["toJSON"]> | null;
  impact: ReturnType<OpportunityImpact["toJSON"]> | null;
  risk: ReturnType<OpportunityRisk["toJSON"]> | null;
  priority: ReturnType<OpportunityPriority["toJSON"]> | null;
  executionPlan: ReturnType<OpportunityExecutionPlan["toJSON"]> | null;
  evidence: ReturnType<OpportunityEvidence["toJSON"]>[];
  recommendations: ReturnType<OpportunityRecommendation["toJSON"]>[];
};

export interface OpportunityRepository {
  saveOpportunity(opportunity: BusinessOpportunity): Promise<void>;
  findOpportunityById(id: BusinessOpportunityId): Promise<BusinessOpportunity | null>;
  findOpportunitiesByOrganization(organizationId: OrganizationId): Promise<BusinessOpportunity[]>;
  findOpportunitiesByCompany(companyId: CompanyId): Promise<BusinessOpportunity[]>;
  saveROI(roi: OpportunityROI): Promise<void>;
  findROIByOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityROI | null>;
  saveImpact(impact: OpportunityImpact): Promise<void>;
  findImpactByOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityImpact | null>;
  saveRisk(risk: OpportunityRisk): Promise<void>;
  findRiskByOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityRisk | null>;
  savePriority(priority: OpportunityPriority): Promise<void>;
  findPriorityByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityPriority | null>;
  saveExecutionPlan(plan: OpportunityExecutionPlan): Promise<void>;
  findExecutionPlanByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityExecutionPlan | null>;
  saveEvidence(evidence: OpportunityEvidence): Promise<void>;
  findEvidenceByOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityEvidence[]>;
  saveRecommendation(recommendation: OpportunityRecommendation): Promise<void>;
  findRecommendationsByOpportunity(
    opportunityId: BusinessOpportunityId,
  ): Promise<OpportunityRecommendation[]>;
  findResultByOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityResult | null>;
}
