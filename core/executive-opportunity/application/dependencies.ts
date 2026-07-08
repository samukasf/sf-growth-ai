import type { EventDispatcher } from "../shared";
import type {
  ExecutionPlanner,
  ImpactAnalyzer,
  OpportunityDetector,
  OpportunityRepository,
  PriorityCalculator,
  RecommendationBuilder,
  RiskAnalyzer,
  ROIAnalyzer,
} from "../domain";
import type {
  BusinessAutomationPort,
  EnterpriseAssessmentPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveProjectsPort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type ExecutiveOpportunityDependencies = {
  repository: OpportunityRepository;
  opportunityDetector: OpportunityDetector;
  roiAnalyzer: ROIAnalyzer;
  priorityCalculator: PriorityCalculator;
  riskAnalyzer: RiskAnalyzer;
  impactAnalyzer: ImpactAnalyzer;
  recommendationBuilder: RecommendationBuilder;
  executionPlanner: ExecutionPlanner;
  eventDispatcher: EventDispatcher;
  enterpriseBrain: EnterpriseBrainPort;
  enterpriseAssessment: EnterpriseAssessmentPort;
  executiveCeo: ExecutiveCEOPort;
  executiveCouncil: ExecutiveCouncilPort;
  executiveProjects: ExecutiveProjectsPort;
  softwareFactory: SoftwareFactoryPort;
  businessAutomation: BusinessAutomationPort;
};
