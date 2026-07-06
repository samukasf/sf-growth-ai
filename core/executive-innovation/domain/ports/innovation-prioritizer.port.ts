import type { InnovationOpportunity } from "../entities";

export interface InnovationPrioritizer {
  prioritize(opportunities: InnovationOpportunity[]): InnovationOpportunity[];
}
