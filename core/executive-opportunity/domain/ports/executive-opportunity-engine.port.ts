import type { BusinessOpportunityId, CompanyId } from "../../shared";
import type { OpportunityResult } from "./opportunity-repository.port";

export type DetectOpportunitiesInput = {
  organizationId: string;
  companyId: string;
  industry?: string;
  assessmentScores?: Record<string, number>;
  context?: Record<string, unknown>;
};

export type DetectOpportunitiesResult = {
  opportunities: OpportunityResult[];
};

export type AnalyzeOpportunityInput = {
  opportunityId: BusinessOpportunityId;
  context?: Record<string, unknown>;
};

export type AnalyzeOpportunityResult = OpportunityResult;

export type ApproveOpportunityInput = {
  opportunityId: BusinessOpportunityId;
  approvedBy: string;
};

export type RejectOpportunityInput = {
  opportunityId: BusinessOpportunityId;
  rejectedBy: string;
  reason: string;
};

export type ExecuteOpportunityInput = {
  opportunityId: BusinessOpportunityId;
  executedBy: string;
};

export interface ExecutiveOpportunityEngine {
  detectOpportunities(input: DetectOpportunitiesInput): Promise<DetectOpportunitiesResult>;
  analyzeOpportunity(input: AnalyzeOpportunityInput): Promise<AnalyzeOpportunityResult>;
  approveOpportunity(input: ApproveOpportunityInput): Promise<OpportunityResult>;
  rejectOpportunity(input: RejectOpportunityInput): Promise<OpportunityResult>;
  executeOpportunity(input: ExecuteOpportunityInput): Promise<OpportunityResult>;
  getOpportunity(opportunityId: BusinessOpportunityId): Promise<OpportunityResult | null>;
  getOpportunitiesByCompany(companyId: CompanyId): Promise<OpportunityResult[]>;
}
