import { OpportunityROI } from "../../domain";
import type { ROIAnalysisInput, ROIAnalysisOutput, ROIAnalyzer } from "../../domain";

const CATEGORY_MULTIPLIERS: Record<string, number> = {
  revenue_growth: 1.3,
  cost_reduction: 1.1,
  automation: 1.25,
  software_opportunity: 1.4,
  digital_transformation: 1.2,
};

export class DefaultROIAnalyzer implements ROIAnalyzer {
  analyze(input: ROIAnalysisInput): ROIAnalysisOutput {
    const { opportunity } = input;
    const multiplier = CATEGORY_MULTIPLIERS[opportunity.category] ?? 1.0;
    const estimatedReturn = Math.round(opportunity.estimatedROI * multiplier);
    const estimatedCost = opportunity.estimatedCost;
    const paybackMonths = estimatedCost > 0 ? Math.ceil((estimatedCost / estimatedReturn) * 12) : 0;
    const annualizedReturn = Math.round((estimatedReturn / Math.max(estimatedCost, 1)) * 100);
    const confidence = Math.min(95, opportunity.confidence + 5);

    const roi = OpportunityROI.create({
      opportunityId: opportunity.id,
      estimatedReturn,
      estimatedCost,
      paybackMonths,
      annualizedReturn,
      confidence,
    });

    return {
      roi,
      estimatedROI: estimatedReturn,
      estimatedCost,
      estimatedTime: opportunity.estimatedTime,
    };
  }
}
