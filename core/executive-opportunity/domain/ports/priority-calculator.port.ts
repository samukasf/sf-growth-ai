import type { BusinessOpportunity, OpportunityPriority } from "../entities";
import type { OpportunityPriorityLevel } from "../../shared";

export type PriorityAnalysisInput = {
  opportunity: BusinessOpportunity;
  roiScore?: number;
  riskScore?: number;
  impactScore?: number;
};

export type PriorityAnalysisOutput = {
  priority: OpportunityPriority;
  level: OpportunityPriorityLevel;
};

export interface PriorityCalculator {
  calculate(input: PriorityAnalysisInput): PriorityAnalysisOutput;
}
