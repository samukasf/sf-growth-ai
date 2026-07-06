import {
  createAutomationOpportunityDetectedEvent,
  createInnovationOpportunityDetectedEvent,
  createSoftwareOpportunityDetectedEvent,
  InnovationOpportunity,
} from "../../domain";
import type { CreateInnovationOpportunityDto, DetectOpportunitiesDto } from "../dto";
import type { ExecutiveInnovationEngineDependencies } from "../dependencies";

export class DetectOpportunitiesUseCase {
  constructor(private readonly deps: ExecutiveInnovationEngineDependencies) {}

  async execute(dto: DetectOpportunitiesDto) {
    const detected = this.deps.opportunityDetector.detect({
      companyId: dto.companyId,
      signals: dto.signals,
    });

    const prioritized = this.deps.prioritizer.prioritize(detected);
    const results = [];

    for (const opportunity of prioritized) {
      const roi = this.deps.roiCalculator.calculate(opportunity);
      const enriched = opportunity.update({
        estimatedROI: roi.estimatedReturn,
        estimatedCost: roi.estimatedCost,
      });

      await this.deps.repository.saveOpportunity(enriched);
      await this.deps.repository.saveROI(roi);
      await this.deps.eventDispatcher.publish(
        createInnovationOpportunityDetectedEvent(enriched),
      );

      const automations = this.deps.automationAnalyzer.analyze(enriched);
      for (const automation of automations) {
        await this.deps.repository.saveAutomationOpportunity(automation);
        await this.deps.eventDispatcher.publish(
          createAutomationOpportunityDetectedEvent(automation),
        );
      }

      const software = this.deps.softwareAnalyzer.analyze(enriched);
      for (const item of software) {
        await this.deps.repository.saveSoftwareOpportunity(item);
        await this.deps.eventDispatcher.publish(createSoftwareOpportunityDetectedEvent(item));
      }

      const improvements = this.deps.businessImprovementAnalyzer.analyze(enriched);
      for (const improvement of improvements) {
        await this.deps.repository.saveBusinessImprovement(improvement);
      }

      const approval = this.deps.approvalGenerator.generate(enriched);
      if (approval) {
        await this.deps.repository.saveApprovalRequest(approval);
      }

      results.push({
        opportunity: enriched,
        automations,
        software,
        improvements,
        approval,
      });
    }

    return results;
  }
}

export class CreateInnovationOpportunityUseCase {
  constructor(private readonly deps: ExecutiveInnovationEngineDependencies) {}

  async execute(dto: CreateInnovationOpportunityDto) {
    const opportunity = InnovationOpportunity.create({
      companyId: dto.companyId,
      title: dto.title,
      description: dto.description,
      problemDetected: dto.problemDetected,
      opportunityType: dto.opportunityType,
      area: dto.area,
      expectedImpact: dto.expectedImpact ?? 50,
      estimatedROI: dto.estimatedROI ?? 0,
      estimatedCost: dto.estimatedCost ?? 0,
      estimatedTime: dto.estimatedTime ?? 0,
      riskLevel: dto.riskLevel ?? "medium",
      confidence: dto.confidence ?? 50,
      requiredApproval: dto.requiredApproval ?? false,
      status: "detected",
      recommendedNextStep: dto.recommendedNextStep ?? "Evaluate opportunity",
      relatedKnowledgeIds: dto.relatedKnowledgeIds ?? [],
      relatedLearningIds: dto.relatedLearningIds ?? [],
      relatedExperienceIds: dto.relatedExperienceIds ?? [],
      relatedWisdomIds: dto.relatedWisdomIds ?? [],
      tags: dto.tags ?? [],
    });

    await this.deps.repository.saveOpportunity(opportunity);
    await this.deps.eventDispatcher.publish(
      createInnovationOpportunityDetectedEvent(opportunity),
    );

    return opportunity;
  }
}
