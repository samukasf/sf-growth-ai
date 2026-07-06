import type { BusinessImprovement, InnovationOpportunity } from "../entities";

export interface BusinessImprovementAnalyzer {
  analyze(opportunity: InnovationOpportunity): BusinessImprovement[];
}
