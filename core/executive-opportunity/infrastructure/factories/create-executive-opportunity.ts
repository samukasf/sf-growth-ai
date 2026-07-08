import type { ExecutiveOpportunityDependencies } from "../../application";
import { ExecutiveOpportunityEngineService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopBusinessAutomationAdapter,
  NoopEnterpriseAssessmentAdapter,
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCouncilAdapter,
  NoopExecutiveProjectsAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryOpportunityRepository } from "../persistence/in-memory-opportunity.repository";
import { DefaultExecutionPlanner } from "../services/default-execution-planner";
import { DefaultImpactAnalyzer } from "../services/default-impact-analyzer";
import { DefaultOpportunityDetector } from "../services/default-opportunity-detector";
import { DefaultPriorityCalculator } from "../services/default-priority-calculator";
import { DefaultRecommendationBuilder } from "../services/default-recommendation-builder";
import { DefaultRiskAnalyzer } from "../services/default-risk-analyzer";
import { DefaultROIAnalyzer } from "../services/default-roi-analyzer";

export type CreateExecutiveOpportunityOptions = {
  dependencies?: Partial<ExecutiveOpportunityDependencies>;
};

export function createExecutiveOpportunity(
  options: CreateExecutiveOpportunityOptions = {},
): ExecutiveOpportunityEngineService {
  const dependencies: ExecutiveOpportunityDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryOpportunityRepository(),
    opportunityDetector:
      options.dependencies?.opportunityDetector ?? new DefaultOpportunityDetector(),
    roiAnalyzer: options.dependencies?.roiAnalyzer ?? new DefaultROIAnalyzer(),
    priorityCalculator:
      options.dependencies?.priorityCalculator ?? new DefaultPriorityCalculator(),
    riskAnalyzer: options.dependencies?.riskAnalyzer ?? new DefaultRiskAnalyzer(),
    impactAnalyzer: options.dependencies?.impactAnalyzer ?? new DefaultImpactAnalyzer(),
    recommendationBuilder:
      options.dependencies?.recommendationBuilder ?? new DefaultRecommendationBuilder(),
    executionPlanner: options.dependencies?.executionPlanner ?? new DefaultExecutionPlanner(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    enterpriseAssessment:
      options.dependencies?.enterpriseAssessment ?? new NoopEnterpriseAssessmentAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveCouncil:
      options.dependencies?.executiveCouncil ?? new NoopExecutiveCouncilAdapter(),
    executiveProjects:
      options.dependencies?.executiveProjects ?? new NoopExecutiveProjectsAdapter(),
    softwareFactory: options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
    businessAutomation:
      options.dependencies?.businessAutomation ?? new NoopBusinessAutomationAdapter(),
  };

  return new ExecutiveOpportunityEngineService(dependencies);
}
