import {
  BusinessOpportunity,
  OpportunityEvidence,
  createOpportunityDetectedEvent,
  createOpportunityUpdatedEvent,
  type DetectOpportunitiesInput,
  type DetectOpportunitiesResult,
} from "../../domain";
import type { ExecutiveOpportunityDependencies } from "../dependencies";

export class DetectOpportunitiesUseCase {
  constructor(private readonly deps: ExecutiveOpportunityDependencies) {}

  async execute(input: DetectOpportunitiesInput): Promise<DetectOpportunitiesResult> {
    let assessmentScores = input.assessmentScores;
    if (!assessmentScores && this.deps.enterpriseAssessment.isAvailable()) {
      assessmentScores = await this.deps.enterpriseAssessment.getAssessmentScores(
        input.organizationId,
        input.companyId,
      );
    }

    const detection = this.deps.opportunityDetector.detect({
      organizationId: input.organizationId,
      companyId: input.companyId,
      industry: input.industry,
      assessmentScores,
      context: input.context,
    });

    const results: DetectOpportunitiesResult["opportunities"] = [];

    for (const opportunity of detection.opportunities) {
      await this.deps.repository.saveOpportunity(opportunity);
      await this.deps.eventDispatcher.publish(createOpportunityDetectedEvent(opportunity));

      const evidence = OpportunityEvidence.create({
        opportunityId: opportunity.id,
        source: "opportunity-detector",
        dataPoints: detection.signals
          .filter((s) => s.title === opportunity.title)
          .flatMap((s) => s.dataPoints),
        confidence: opportunity.confidence,
      });
      await this.deps.repository.saveEvidence(evidence);

      const analyzed = await this.analyzeOpportunity(opportunity, input.context);
      results.push(analyzed);
    }

    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.syncOpportunities(
        input.organizationId,
        input.companyId,
        results.map((r) => r.opportunity),
      );
    }

    return { opportunities: results };
  }

  private async analyzeOpportunity(
    opportunity: BusinessOpportunity,
    context?: Record<string, unknown>,
  ) {
    const roiResult = this.deps.roiAnalyzer.analyze({ opportunity, context });
    await this.deps.repository.saveROI(roiResult.roi);

    const impactResult = this.deps.impactAnalyzer.analyze({ opportunity, context });
    await this.deps.repository.saveImpact(impactResult.impact);

    const riskResult = this.deps.riskAnalyzer.analyze({ opportunity, context });
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
      createOpportunityUpdatedEvent(updated, ["roi", "impact", "risk", "priority", "recommendations"]),
    );

    if (updated.category === "software_opportunity" && this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.evaluateSoftwareOpportunity(
        updated.organizationId,
        updated.companyId,
        updated,
      );
    }

    if (updated.category === "automation" && this.deps.businessAutomation.isAvailable()) {
      await this.deps.businessAutomation.evaluateAutomationOpportunity(
        updated.organizationId,
        updated.companyId,
        updated,
      );
    }

    const result = await this.deps.repository.findResultByOpportunity(updated.id);
    return result!;
  }
}
