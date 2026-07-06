import type { RiskLevel } from "../../domain";

export type RecordExecutiveExperienceDto = {
  companyId: string;
  title: string;
  context: string;
  scenario: string;
  decision: string;
  execution: string;
  result: string;
  businessImpact?: number;
  roi?: number;
  successLevel?: number;
  confidence?: number;
  risk?: RiskLevel;
  duration?: number;
  participants?: string[];
  knowledgeReferences?: string[];
  learningReferences?: string[];
  wisdomReferences?: string[];
  tags?: string[];
};
