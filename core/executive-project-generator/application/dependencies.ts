import type { EventDispatcher } from "../shared";
import type {
  ApprovalCoordinator,
  BusinessCaseBuilder,
  DependencyAnalyzer,
  PriorityEngine,
  ProjectPlanner,
  ProjectRepository,
  ROIEngine,
  RoadmapGenerator,
} from "../domain";
import type {
  BusinessAutomationPlatformPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveMissionSystemPort,
  ExecutiveOpportunityEnginePort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type ExecutiveProjectGeneratorDependencies = {
  repository: ProjectRepository;
  businessCaseBuilder: BusinessCaseBuilder;
  roadmapGenerator: RoadmapGenerator;
  roiEngine: ROIEngine;
  priorityEngine: PriorityEngine;
  projectPlanner: ProjectPlanner;
  dependencyAnalyzer: DependencyAnalyzer;
  approvalCoordinator: ApprovalCoordinator;
  eventDispatcher: EventDispatcher;
  enterpriseBrain: EnterpriseBrainPort;
  executiveOpportunityEngine: ExecutiveOpportunityEnginePort;
  executiveMissionSystem: ExecutiveMissionSystemPort;
  executiveCeo: ExecutiveCEOPort;
  executiveCouncil: ExecutiveCouncilPort;
  businessAutomationPlatform: BusinessAutomationPlatformPort;
  softwareFactory: SoftwareFactoryPort;
};

