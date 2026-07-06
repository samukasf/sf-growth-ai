import type { InnovationOpportunity } from "../entities";

export type OpportunityDetectionInput = {
  companyId: string;
  signals: Array<{
    source: "knowledge" | "learning" | "experience" | "wisdom" | "manual";
    referenceId?: string;
    problem: string;
    area: string;
    tags?: string[];
  }>;
};

export interface OpportunityDetector {
  detect(input: OpportunityDetectionInput): InnovationOpportunity[];
}
