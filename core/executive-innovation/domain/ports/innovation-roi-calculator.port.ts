import type { InnovationOpportunity, InnovationROI } from "../entities";

export interface InnovationROICalculator {
  calculate(opportunity: InnovationOpportunity): InnovationROI;
}
