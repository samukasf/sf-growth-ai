import type { EventDispatcher } from "../shared";
import type {
  AgencyContextBuilder,
  AgencyCoordinator,
  AgencyDashboardBuilder,
  AgencyHealthEngine,
  AgencyMetricsEngine,
  AgencyRepository,
} from "../domain";
import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveContextPort,
  ExecutiveCouncilPort,
  ExecutiveCRMPort,
  ExecutiveDashboardPort,
  ExecutiveMemoryPort,
  ExecutiveTimelinePort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type AgencyCoreDependencies = {
  repository: AgencyRepository;
  contextBuilder: AgencyContextBuilder;
  healthEngine: AgencyHealthEngine;
  dashboardBuilder: AgencyDashboardBuilder;
  metricsEngine: AgencyMetricsEngine;
  coordinator: AgencyCoordinator;
  eventDispatcher: EventDispatcher;
  companyBrain: CompanyBrainPort;
  enterpriseBrain: EnterpriseBrainPort;
  executiveCouncil: ExecutiveCouncilPort;
  executiveCeo: ExecutiveCEOPort;
  executiveCrm: ExecutiveCRMPort;
  businessCommunication: BusinessCommunicationPort;
  businessAutomation: BusinessAutomationPort;
  softwareFactory: SoftwareFactoryPort;
  executiveMemory: ExecutiveMemoryPort;
  executiveContext: ExecutiveContextPort;
  executiveTimeline: ExecutiveTimelinePort;
  executiveDashboard: ExecutiveDashboardPort;
};
