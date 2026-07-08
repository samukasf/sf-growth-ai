import type { AgencyCoreDependencies } from "../../application";
import { AgencyRuntimeService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopBusinessAutomationAdapter,
  NoopBusinessCommunicationAdapter,
  NoopCompanyBrainAdapter,
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveContextAdapter,
  NoopExecutiveCouncilAdapter,
  NoopExecutiveCRMAdapter,
  NoopExecutiveDashboardAdapter,
  NoopExecutiveMemoryAdapter,
  NoopExecutiveTimelineAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryAgencyRepository } from "../persistence/in-memory-agency.repository";
import { DefaultAgencyCoordinator } from "../services/default-agency-coordinator";
import { DefaultAgencyContextBuilder } from "../services/default-context-builder";
import { DefaultAgencyDashboardBuilder } from "../services/default-dashboard-builder";
import { DefaultAgencyHealthEngine } from "../services/default-health-engine";
import { DefaultAgencyMetricsEngine } from "../services/default-metrics-engine";

export type CreateAgencyCoreOptions = {
  dependencies?: Partial<AgencyCoreDependencies>;
};

export function createAgencyCore(options: CreateAgencyCoreOptions = {}): AgencyRuntimeService {
  const repository = options.dependencies?.repository ?? new InMemoryAgencyRepository();

  const partialDeps: AgencyCoreDependencies = {
    repository,
    contextBuilder:
      options.dependencies?.contextBuilder ?? new DefaultAgencyContextBuilder(repository),
    healthEngine:
      options.dependencies?.healthEngine ?? new DefaultAgencyHealthEngine(repository),
    dashboardBuilder:
      options.dependencies?.dashboardBuilder ?? new DefaultAgencyDashboardBuilder(repository),
    metricsEngine:
      options.dependencies?.metricsEngine ?? new DefaultAgencyMetricsEngine(repository),
    coordinator: options.dependencies?.coordinator ?? new DefaultAgencyCoordinator({} as AgencyCoreDependencies),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    executiveCouncil: options.dependencies?.executiveCouncil ?? new NoopExecutiveCouncilAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveCrm: options.dependencies?.executiveCrm ?? new NoopExecutiveCRMAdapter(),
    businessCommunication:
      options.dependencies?.businessCommunication ?? new NoopBusinessCommunicationAdapter(),
    businessAutomation:
      options.dependencies?.businessAutomation ?? new NoopBusinessAutomationAdapter(),
    softwareFactory: options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
    executiveMemory: options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveContext: options.dependencies?.executiveContext ?? new NoopExecutiveContextAdapter(),
    executiveTimeline: options.dependencies?.executiveTimeline ?? new NoopExecutiveTimelineAdapter(),
    executiveDashboard:
      options.dependencies?.executiveDashboard ?? new NoopExecutiveDashboardAdapter(),
  };

  partialDeps.coordinator =
    options.dependencies?.coordinator ?? new DefaultAgencyCoordinator(partialDeps);

  return new AgencyRuntimeService(partialDeps);
}
