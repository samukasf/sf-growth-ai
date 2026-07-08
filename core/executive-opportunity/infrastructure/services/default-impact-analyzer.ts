import { OpportunityImpact } from "../../domain";
import type { ImpactAnalysisInput, ImpactAnalysisOutput, ImpactAnalyzer } from "../../domain";
import { clampScore } from "../../shared";

const CATEGORY_IMPACT: Record<string, { revenue: number; cost: number; efficiency: number; customer: number }> = {
  revenue_growth: { revenue: 85, cost: 20, efficiency: 40, customer: 50 },
  cost_reduction: { revenue: 30, cost: 90, efficiency: 70, customer: 20 },
  automation: { revenue: 40, cost: 75, efficiency: 95, customer: 35 },
  customer_experience: { revenue: 60, cost: 25, efficiency: 45, customer: 95 },
  marketing: { revenue: 75, cost: 30, efficiency: 40, customer: 70 },
  sales: { revenue: 90, cost: 25, efficiency: 50, customer: 55 },
  software_opportunity: { revenue: 55, cost: 40, efficiency: 85, customer: 45 },
  digital_transformation: { revenue: 50, cost: 45, efficiency: 80, customer: 60 },
};

export class DefaultImpactAnalyzer implements ImpactAnalyzer {
  analyze(input: ImpactAnalysisInput): ImpactAnalysisOutput {
    const { opportunity } = input;
    const profile = CATEGORY_IMPACT[opportunity.category] ?? {
      revenue: 50,
      cost: 50,
      efficiency: 50,
      customer: 50,
    };

    const score = clampScore(
      (profile.revenue + profile.cost + profile.efficiency + profile.customer) / 4,
    );

    const impact = OpportunityImpact.create({
      opportunityId: opportunity.id,
      score,
      revenueImpact: profile.revenue,
      costImpact: profile.cost,
      efficiencyImpact: profile.efficiency,
      customerImpact: profile.customer,
      summary: `Impacto estimado em ${opportunity.category.replace(/_/g, " ")} com score ${score}.`,
    });

    return { impact, businessImpact: score };
  }
}
