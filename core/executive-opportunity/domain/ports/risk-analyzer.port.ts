import type { BusinessOpportunity, OpportunityRisk } from "../entities";
import type { OpportunityRiskLevel } from "../../shared";

export type RiskAnalysisInput = {
  opportunity: BusinessOpportunity;
  context?: Record<string, unknown>;
};

export type RiskAnalysisOutput = {
  risk: OpportunityRisk;
  level: OpportunityRiskLevel;
};

export interface RiskAnalyzer {
  analyze(input: RiskAnalysisInput): RiskAnalysisOutput;
}
