import type { MultiTenantDependencies } from "../../application";
import { TenantRuntimeService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopAgencyCoreAdapter,
  NoopBusinessAutomationAdapter,
  NoopBusinessCommunicationAdapter,
  NoopCompanyBrainAdapter,
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCouncilAdapter,
  NoopExecutiveDashboardAdapter,
  NoopExecutiveMemoryAdapter,
  NoopExecutiveMissionsAdapter,
  NoopExecutiveOpportunitiesAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveProjectsAdapter,
  NoopExecutiveTimelineAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryTenantRepository } from "../persistence/in-memory-tenant.repository";
import { DefaultTenantContextBuilder } from "../services/default-context-builder";
import { DefaultTenantLifecycleManager } from "../services/default-lifecycle-manager";
import {
  DefaultTenantIsolationEngine,
  DefaultTenantRegistry,
  DefaultTenantResolver,
} from "../services/default-tenant-resolver";

export type CreateMultiTenantOptions = {
  dependencies?: Partial<MultiTenantDependencies>;
};

export function createMultiTenant(
  options: CreateMultiTenantOptions = {},
): TenantRuntimeService {
  const repository = options.dependencies?.repository ?? new InMemoryTenantRepository();

  const partialDeps: MultiTenantDependencies = {
    repository,
    resolver: options.dependencies?.resolver ?? new DefaultTenantResolver(repository),
    contextBuilder:
      options.dependencies?.contextBuilder ?? new DefaultTenantContextBuilder(repository),
    isolationEngine:
      options.dependencies?.isolationEngine ?? new DefaultTenantIsolationEngine(repository),
    registry: options.dependencies?.registry ?? new DefaultTenantRegistry(repository),
    lifecycleManager: options.dependencies?.lifecycleManager ?? new DefaultTenantLifecycleManager({} as MultiTenantDependencies),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    agencyCore: options.dependencies?.agencyCore ?? new NoopAgencyCoreAdapter(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    businessCommunication:
      options.dependencies?.businessCommunication ?? new NoopBusinessCommunicationAdapter(),
    businessAutomation:
      options.dependencies?.businessAutomation ?? new NoopBusinessAutomationAdapter(),
    softwareFactory: options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    executiveMemory: options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveCouncil: options.dependencies?.executiveCouncil ?? new NoopExecutiveCouncilAdapter(),
    executiveTimeline: options.dependencies?.executiveTimeline ?? new NoopExecutiveTimelineAdapter(),
    executiveDashboard:
      options.dependencies?.executiveDashboard ?? new NoopExecutiveDashboardAdapter(),
    executiveMissions: options.dependencies?.executiveMissions ?? new NoopExecutiveMissionsAdapter(),
    executiveOpportunities:
      options.dependencies?.executiveOpportunities ?? new NoopExecutiveOpportunitiesAdapter(),
    executiveProjects: options.dependencies?.executiveProjects ?? new NoopExecutiveProjectsAdapter(),
  };

  partialDeps.lifecycleManager =
    options.dependencies?.lifecycleManager ?? new DefaultTenantLifecycleManager(partialDeps);

  return new TenantRuntimeService(partialDeps);
}
