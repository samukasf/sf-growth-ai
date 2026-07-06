import {
  InnovationROI,
  type InnovationOpportunity,
  type InnovationROICalculator,
} from "../../domain";

export class DefaultInnovationROICalculator implements InnovationROICalculator {
  calculate(opportunity: InnovationOpportunity): InnovationROI {
    const monthlyBenefit =
      opportunity.opportunityType === "revenue_increase"
        ? opportunity.expectedImpact * 500
        : opportunity.opportunityType === "cost_reduction"
          ? opportunity.expectedImpact * 300
          : opportunity.expectedImpact * 200;

    const annualReturn = monthlyBenefit * 12;
    const estimatedCost = opportunity.estimatedCost || 5000;
    const paybackMonths =
      monthlyBenefit > 0 ? Math.ceil(estimatedCost / monthlyBenefit) : 0;

    return InnovationROI.create({
      companyId: opportunity.companyId,
      opportunityId: opportunity.id,
      estimatedReturn: annualReturn,
      estimatedCost,
      paybackMonths,
      confidence: opportunity.confidence,
    });
  }
}
