import type { EventDispatcher } from "../shared";
import type {
  BusinessHealthAnalyzer,
  BusinessOperatingRepository,
  DailyCoordinator,
  ExecutiveReviewBuilder,
  OperationsMonitor,
  PriorityEngine,
  RoutinePlanner,
} from "../domain";
import type {
  AgencyCorePort,
  ClientLifecyclePort,
  CompanyBrainPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveMissionsPort,
  ExecutiveOpportunitiesPort,
} from "./ports/integration";

export type BusinessOperatingDependencies = {
  repository: BusinessOperatingRepository;
  dailyCoordinator: DailyCoordinator;
  priorityEngine: PriorityEngine;
  routinePlanner: RoutinePlanner;
  operationsMonitor: OperationsMonitor;
  executiveReviewBuilder: ExecutiveReviewBuilder;
  healthAnalyzer: BusinessHealthAnalyzer;
  eventDispatcher: EventDispatcher;
  agencyCore: AgencyCorePort;
  clientLifecycle: ClientLifecyclePort;
  companyBrain: CompanyBrainPort;
  enterpriseBrain: EnterpriseBrainPort;
  executiveCeo: ExecutiveCEOPort;
  executiveCouncil: ExecutiveCouncilPort;
  executiveMissions: ExecutiveMissionsPort;
  executiveOpportunities: ExecutiveOpportunitiesPort;
};
