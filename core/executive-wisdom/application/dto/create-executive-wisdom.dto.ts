import type { RiskLevel } from "../../domain";

export type CreateExecutiveWisdomDto = {
  companyId: string;
  knowledgeIds?: string[];
  learningIds?: string[];
  confidence?: number;
  importance?: number;
  businessImpact?: number;
  risk?: RiskLevel;
  recommendation: string;
  reasoning?: string;
  expectedOutcome?: string;
  successRate?: number;
  roi?: number;
  tags?: string[];
};
