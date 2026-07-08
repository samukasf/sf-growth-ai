import type { BusinessOpportunity, OpportunityROI } from "../entities";

export type ROIAnalysisInput = {
  opportunity: BusinessOpportunity;
  context?: Record<string, unknown>;
};

export type ROIAnalysisOutput = {
  roi: OpportunityROI;
  estimatedROI: number;
  estimatedCost: number;
  estimatedTime: number;
};

export interface ROIAnalyzer {
  analyze(input: ROIAnalysisInput): ROIAnalysisOutput;
}
