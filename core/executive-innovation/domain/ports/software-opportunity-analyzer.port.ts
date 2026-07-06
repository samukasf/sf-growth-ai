import type { InnovationOpportunity, SoftwareOpportunity } from "../entities";

export interface SoftwareOpportunityAnalyzer {
  analyze(opportunity: InnovationOpportunity): SoftwareOpportunity[];
}
