import type { ClientLifecycleDependencies } from "../../application";
import { ClientLifecycleRuntimeService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopAgencyCoreAdapter,
  NoopBusinessAutomationAdapter,
  NoopBusinessCommunicationAdapter,
  NoopCompanyBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCouncilAdapter,
  NoopExecutiveCRMAdapter,
  NoopExecutiveDashboardAdapter,
  NoopExecutiveMemoryAdapter,
  NoopExecutiveMissionsAdapter,
  NoopExecutiveTimelineAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryClientLifecycleRepository } from "../persistence/in-memory-lifecycle.repository";
import { DefaultClientTimelineBuilder } from "../services/default-client-timeline-builder";
import { DefaultHealthEngine } from "../services/default-health-engine";
import { DefaultJourneyCoordinator } from "../services/default-journey-coordinator";
import { DefaultRelationshipManager } from "../services/default-relationship-manager";
import { DefaultRenewalEngine } from "../services/default-renewal-engine";
import { DefaultUpsellEngine } from "../services/default-upsell-engine";

export type CreateClientLifecycleOptions = {
  dependencies?: Partial<ClientLifecycleDependencies>;
};

export function createClientLifecycle(
  options: CreateClientLifecycleOptions = {},
): ClientLifecycleRuntimeService {
  const repository =
    options.dependencies?.repository ?? new InMemoryClientLifecycleRepository();

  const partialDeps: ClientLifecycleDependencies = {
    repository,
    healthEngine: options.dependencies?.healthEngine ?? new DefaultHealthEngine(repository),
    renewalEngine: options.dependencies?.renewalEngine ?? new DefaultRenewalEngine(repository),
    relationshipManager:
      options.dependencies?.relationshipManager ?? new DefaultRelationshipManager(repository),
    upsellEngine: options.dependencies?.upsellEngine ?? new DefaultUpsellEngine(repository),
    timelineBuilder:
      options.dependencies?.timelineBuilder ?? new DefaultClientTimelineBuilder(repository),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    agencyCore: options.dependencies?.agencyCore ?? new NoopAgencyCoreAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveCouncil: options.dependencies?.executiveCouncil ?? new NoopExecutiveCouncilAdapter(),
    executiveCrm: options.dependencies?.executiveCrm ?? new NoopExecutiveCRMAdapter(),
    businessCommunication:
      options.dependencies?.businessCommunication ?? new NoopBusinessCommunicationAdapter(),
    businessAutomation:
      options.dependencies?.businessAutomation ?? new NoopBusinessAutomationAdapter(),
    executiveMemory: options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveTimeline:
      options.dependencies?.executiveTimeline ?? new NoopExecutiveTimelineAdapter(),
    executiveDashboard:
      options.dependencies?.executiveDashboard ?? new NoopExecutiveDashboardAdapter(),
    executiveMissions:
      options.dependencies?.executiveMissions ?? new NoopExecutiveMissionsAdapter(),
    journeyCoordinator: new DefaultJourneyCoordinator({} as ClientLifecycleDependencies),
  };

  partialDeps.journeyCoordinator =
    options.dependencies?.journeyCoordinator ?? new DefaultJourneyCoordinator(partialDeps);

  return new ClientLifecycleRuntimeService(partialDeps);
}
