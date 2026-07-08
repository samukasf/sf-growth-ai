import {
  createOpportunityUpdatedEvent,
  type AnalyzeOpportunityInput,
  type AnalyzeOpportunityResult,
} from "../../domain";
import { OpportunityNotFoundError } from "../../shared";
import type { ExecutiveOpportunityDependencies } from "../dependencies";

export class AnalyzeOpportunityUseCase {
  constructor(private readonly deps: ExecutiveOpportunityDependencies) {}

  async execute(input: AnalyzeOpportunityInput): Promise<AnalyzeOpportunityResult> {
    const opportunity = await this.deps.repository.findOpportunityById(input.opportunityId);
    if (!opportunity) throw new OpportunityNotFoundError(input.opportunityId);

    const roiResult = this.deps.roiAnalyzer.analyze({ opportunity, context: input.context });
    await this.deps.repository.saveROI(roiResult.roi);

    const impactResult = this.deps.impactAnalyzer.analyze({ opportunity, context: input.context });
    await this.deps.repository.saveImpact(impactResult.impact);

    const riskResult = this.deps.riskAnalyzer.analyze({ opportunity, context: input.context });
    await this.deps.repository.saveRisk(riskResult.risk);

    const priorityResult = this.deps.priorityCalculator.calculate({
      opportunity,
      roiScore: roiResult.estimatedROI,
      riskScore: riskResult.risk.score,
      impactScore: impactResult.businessImpact,
    });
    await this.deps.repository.savePriority(priorityResult.priority);

    const recommendationResult = this.deps.recommendationBuilder.build({
      opportunity,
      impactScore: impactResult.businessImpact,
      riskLevel: riskResult.level,
    });
    for (const rec of recommendationResult.recommendations) {
      await this.deps.repository.saveRecommendation(rec);
    }

    const planResult = this.deps.executionPlanner.plan({
      opportunity,
      recommendations: recommendationResult.recommendations.map((r) => r.title),
    });
    await this.deps.repository.saveExecutionPlan(planResult.plan);

    const updated = opportunity.withAnalysis({
      estimatedROI: roiResult.estimatedROI,
      estimatedCost: roiResult.estimatedCost,
      estimatedTime: roiResult.estimatedTime,
      priority: priorityResult.level,
      confidence: roiResult.roi.confidence,
      businessImpact: impactResult.businessImpact,
      riskLevel: riskResult.level,
      recommendedActions: recommendationResult.recommendedActions,
    });
    await this.deps.repository.saveOpportunity(updated);
    await this.deps.eventDispatcher.publish(
      createOpportunityUpdatedEvent(updated, ["full-analysis"]),
    );

    const result = await this.deps.repository.findResultByOpportunity(updated.id);
    return result!;
  }
}
