import type { EnterpriseAssessmentDependencies } from "../../application";
import { AssessmentEngineService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveInnovationAdapter,
  NoopExecutiveProjectsAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryAssessmentRepository } from "../persistence/in-memory-assessment.repository";
import { DefaultBenchmarkEngine } from "../services/default-benchmark-engine";
import { DefaultPriorityAnalyzer } from "../services/default-priority-analyzer";
import { DefaultRecommendationEngine } from "../services/default-recommendation-engine";
import { DefaultRoadmapGenerator } from "../services/default-roadmap-generator";
import { DefaultScoreCalculator } from "../services/default-score-calculator";

export type CreateEnterpriseAssessmentOptions = {
  dependencies?: Partial<EnterpriseAssessmentDependencies>;
};

export function createEnterpriseAssessment(
  options: CreateEnterpriseAssessmentOptions = {},
): AssessmentEngineService {
  const dependencies: EnterpriseAssessmentDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryAssessmentRepository(),
    scoreCalculator: options.dependencies?.scoreCalculator ?? new DefaultScoreCalculator(),
    benchmarkEngine: options.dependencies?.benchmarkEngine ?? new DefaultBenchmarkEngine(),
    recommendationEngine:
      options.dependencies?.recommendationEngine ?? new DefaultRecommendationEngine(),
    roadmapGenerator: options.dependencies?.roadmapGenerator ?? new DefaultRoadmapGenerator(),
    priorityAnalyzer: options.dependencies?.priorityAnalyzer ?? new DefaultPriorityAnalyzer(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    executiveInnovation:
      options.dependencies?.executiveInnovation ?? new NoopExecutiveInnovationAdapter(),
    executiveProjects: options.dependencies?.executiveProjects ?? new NoopExecutiveProjectsAdapter(),
    softwareFactory: options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
  };

  return new AssessmentEngineService(dependencies);
}
