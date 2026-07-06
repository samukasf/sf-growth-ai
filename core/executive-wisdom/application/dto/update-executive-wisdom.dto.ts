import type { RiskLevel } from "../../domain";

export type UpdateExecutiveWisdomDto = {
  wisdomId: string;
  confidence?: number;
  importance?: number;
  businessImpact?: number;
  risk?: RiskLevel;
  recommendation?: string;
  reasoning?: string;
  expectedOutcome?: string;
  successRate?: number;
  roi?: number;
  tags?: string[];
};
