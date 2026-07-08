import type { ExecutiveProjectGeneratorDependencies } from "../../application";
import { ExecutiveProjectGeneratorService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopBusinessAutomationPlatformAdapter,
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCouncilAdapter,
  NoopExecutiveMissionSystemAdapter,
  NoopExecutiveOpportunityEngineAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryProjectRepository } from "../persistence/in-memory-project.repository";
import { DefaultApprovalCoordinator } from "../services/default-approval-coordinator";
import { DefaultBusinessCaseBuilder } from "../services/default-business-case-builder";
import { DefaultDependencyAnalyzer } from "../services/default-dependency-analyzer";
import { DefaultPriorityEngine } from "../services/default-priority-engine";
import { DefaultProjectPlanner } from "../services/default-project-planner";
import { DefaultROIEngine } from "../services/default-roi-engine";
import { DefaultRoadmapGenerator } from "../services/default-roadmap-generator";

export type CreateExecutiveProjectGeneratorOptions = {
  dependencies?: Partial<ExecutiveProjectGeneratorDependencies>;
};

export function createExecutiveProjectGenerator(
  options: CreateExecutiveProjectGeneratorOptions = {},
): ExecutiveProjectGeneratorService {
  const dependencies: ExecutiveProjectGeneratorDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryProjectRepository(),
    businessCaseBuilder: options.dependencies?.businessCaseBuilder ?? new DefaultBusinessCaseBuilder(),
    roadmapGenerator: options.dependencies?.roadmapGenerator ?? new DefaultRoadmapGenerator(),
    roiEngine: options.dependencies?.roiEngine ?? new DefaultROIEngine(),
    priorityEngine: options.dependencies?.priorityEngine ?? new DefaultPriorityEngine(),
    projectPlanner: options.dependencies?.projectPlanner ?? new DefaultProjectPlanner(),
    dependencyAnalyzer: options.dependencies?.dependencyAnalyzer ?? new DefaultDependencyAnalyzer(),
    approvalCoordinator: options.dependencies?.approvalCoordinator ?? new DefaultApprovalCoordinator(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    executiveOpportunityEngine:
      options.dependencies?.executiveOpportunityEngine ?? new NoopExecutiveOpportunityEngineAdapter(),
    executiveMissionSystem:
      options.dependencies?.executiveMissionSystem ?? new NoopExecutiveMissionSystemAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveCouncil: options.dependencies?.executiveCouncil ?? new NoopExecutiveCouncilAdapter(),
    businessAutomationPlatform:
      options.dependencies?.businessAutomationPlatform ?? new NoopBusinessAutomationPlatformAdapter(),
    softwareFactory: options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
  };

  return new ExecutiveProjectGeneratorService(dependencies);
}

