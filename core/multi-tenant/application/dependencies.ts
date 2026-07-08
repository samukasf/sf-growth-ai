import type { EventDispatcher } from "../shared";
import type {
  TenantContextBuilder,
  TenantIsolationEngine,
  TenantLifecycleManager,
  TenantRegistry,
  TenantRepository,
  TenantResolver,
} from "../domain";
import type {
  AgencyCorePort,
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveDashboardPort,
  ExecutiveMemoryPort,
  ExecutiveMissionsPort,
  ExecutiveOpportunitiesPort,
  ExecutiveOrchestratorPort,
  ExecutiveProjectsPort,
  ExecutiveTimelinePort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type MultiTenantDependencies = {
  repository: TenantRepository;
  resolver: TenantResolver;
  contextBuilder: TenantContextBuilder;
  isolationEngine: TenantIsolationEngine;
  registry: TenantRegistry;
  lifecycleManager: TenantLifecycleManager;
  eventDispatcher: EventDispatcher;
  agencyCore: AgencyCorePort;
  enterpriseBrain: EnterpriseBrainPort;
  executiveCeo: ExecutiveCEOPort;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  businessCommunication: BusinessCommunicationPort;
  businessAutomation: BusinessAutomationPort;
  softwareFactory: SoftwareFactoryPort;
  companyBrain: CompanyBrainPort;
  executiveMemory: ExecutiveMemoryPort;
  executiveCouncil: ExecutiveCouncilPort;
  executiveTimeline: ExecutiveTimelinePort;
  executiveDashboard: ExecutiveDashboardPort;
  executiveMissions: ExecutiveMissionsPort;
  executiveOpportunities: ExecutiveOpportunitiesPort;
  executiveProjects: ExecutiveProjectsPort;
};
