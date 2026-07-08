import type { BusinessOpportunity, OpportunityImpact } from "../entities";

export type ImpactAnalysisInput = {
  opportunity: BusinessOpportunity;
  context?: Record<string, unknown>;
};

export type ImpactAnalysisOutput = {
  impact: OpportunityImpact;
  businessImpact: number;
};

export interface ImpactAnalyzer {
  analyze(input: ImpactAnalysisInput): ImpactAnalysisOutput;
}
