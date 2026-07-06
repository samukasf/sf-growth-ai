import type { AutomationOpportunity, InnovationOpportunity } from "../entities";

export interface AutomationOpportunityAnalyzer {
  analyze(opportunity: InnovationOpportunity): AutomationOpportunity[];
}
