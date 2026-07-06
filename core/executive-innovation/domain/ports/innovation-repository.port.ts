import type { CompanyId, InnovationOpportunityId } from "../../shared";
import type {
  AutomationOpportunity,
  BusinessImprovement,
  InnovationApprovalRequest,
  InnovationHypothesis,
  InnovationImpact,
  InnovationOpportunity,
  InnovationProject,
  InnovationROI,
  SoftwareOpportunity,
} from "../entities";

export type InnovationQuery = {
  companyId: CompanyId;
  opportunityType?: string;
  area?: string;
  status?: string;
  minConfidence?: number;
  minExpectedImpact?: number;
  limit?: number;
};

export interface InnovationRepository {
  saveOpportunity(opportunity: InnovationOpportunity): Promise<void>;
  findOpportunityById(id: InnovationOpportunityId): Promise<InnovationOpportunity | null>;
  findOpportunitiesByCompany(companyId: CompanyId): Promise<InnovationOpportunity[]>;
  queryOpportunities(filters: InnovationQuery): Promise<InnovationOpportunity[]>;
  deleteOpportunity(id: InnovationOpportunityId): Promise<void>;
  saveProject(project: InnovationProject): Promise<void>;
  findProjectsByCompany(companyId: CompanyId): Promise<InnovationProject[]>;
  saveAutomationOpportunity(automation: AutomationOpportunity): Promise<void>;
  saveSoftwareOpportunity(software: SoftwareOpportunity): Promise<void>;
  saveBusinessImprovement(improvement: BusinessImprovement): Promise<void>;
  saveHypothesis(hypothesis: InnovationHypothesis): Promise<void>;
  saveImpact(impact: InnovationImpact): Promise<void>;
  saveROI(roi: InnovationROI): Promise<void>;
  saveApprovalRequest(request: InnovationApprovalRequest): Promise<void>;
  findApprovalRequests(companyId: CompanyId): Promise<InnovationApprovalRequest[]>;
}
