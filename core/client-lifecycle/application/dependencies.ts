import type { EventDispatcher } from "../shared";
import type {
  ClientLifecycleRepository,
  ClientTimelineBuilder,
  HealthEngine,
  JourneyCoordinator,
  RelationshipManager,
  RenewalEngine,
  UpsellEngine,
} from "../domain";
import type {
  AgencyCorePort,
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveCRMPort,
  ExecutiveDashboardPort,
  ExecutiveMemoryPort,
  ExecutiveMissionsPort,
  ExecutiveTimelinePort,
} from "./ports/integration";

export type ClientLifecycleDependencies = {
  repository: ClientLifecycleRepository;
  journeyCoordinator: JourneyCoordinator;
  healthEngine: HealthEngine;
  renewalEngine: RenewalEngine;
  relationshipManager: RelationshipManager;
  upsellEngine: UpsellEngine;
  timelineBuilder: ClientTimelineBuilder;
  eventDispatcher: EventDispatcher;
  agencyCore: AgencyCorePort;
  companyBrain: CompanyBrainPort;
  executiveCeo: ExecutiveCEOPort;
  executiveCouncil: ExecutiveCouncilPort;
  executiveCrm: ExecutiveCRMPort;
  businessCommunication: BusinessCommunicationPort;
  businessAutomation: BusinessAutomationPort;
  executiveMemory: ExecutiveMemoryPort;
  executiveTimeline: ExecutiveTimelinePort;
  executiveDashboard: ExecutiveDashboardPort;
  executiveMissions: ExecutiveMissionsPort;
};
