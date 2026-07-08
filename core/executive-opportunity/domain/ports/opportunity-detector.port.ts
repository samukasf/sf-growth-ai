import type { BusinessOpportunity } from "../entities";
import type { OpportunityCategoryKey, OpportunityType } from "../../shared";

export type DetectionSignal = {
  type: OpportunityType;
  category: OpportunityCategoryKey;
  title: string;
  description: string;
  confidence: number;
  source: string;
  dataPoints: string[];
};

export type DetectOpportunitiesContext = {
  organizationId: string;
  companyId: string;
  industry?: string;
  assessmentScores?: Record<string, number>;
  signals?: DetectionSignal[];
  context?: Record<string, unknown>;
};

export type DetectOpportunitiesOutput = {
  opportunities: BusinessOpportunity[];
  signals: DetectionSignal[];
};

export interface OpportunityDetector {
  detect(context: DetectOpportunitiesContext): DetectOpportunitiesOutput;
}
