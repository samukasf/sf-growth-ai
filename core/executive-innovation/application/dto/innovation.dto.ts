import type { OpportunityArea, OpportunityType, RiskLevel } from "../../domain";

export type DetectOpportunitiesDto = {
  companyId: string;
  signals: Array<{
    source: "knowledge" | "learning" | "experience" | "wisdom" | "manual";
    referenceId?: string;
    problem: string;
    area: string;
    tags?: string[];
  }>;
};

export type CreateInnovationOpportunityDto = {
  companyId: string;
  title: string;
  description: string;
  problemDetected: string;
  opportunityType: OpportunityType;
  area: OpportunityArea;
  expectedImpact?: number;
  estimatedROI?: number;
  estimatedCost?: number;
  estimatedTime?: number;
  riskLevel?: RiskLevel;
  confidence?: number;
  requiredApproval?: boolean;
  recommendedNextStep?: string;
  relatedKnowledgeIds?: string[];
  relatedLearningIds?: string[];
  relatedExperienceIds?: string[];
  relatedWisdomIds?: string[];
  tags?: string[];
};

export type ApproveInnovationDto = { opportunityId: string };
export type RejectInnovationDto = { opportunityId: string };
export type CreateInnovationProjectDto = { companyId: string; opportunityId: string };
