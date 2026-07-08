import type { BusinessOperatingDependencies } from "../../application";
import { BusinessOperatingRuntimeService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopAgencyCoreAdapter,
  NoopClientLifecycleAdapter,
  NoopCompanyBrainAdapter,
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCouncilAdapter,
  NoopExecutiveMissionsAdapter,
  NoopExecutiveOpportunitiesAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryBusinessOperatingRepository } from "../persistence/in-memory-operating.repository";
import { DefaultBusinessHealthAnalyzer } from "../services/default-business-health-analyzer";
import { DefaultDailyCoordinator } from "../services/default-daily-coordinator";
import { DefaultExecutiveReviewBuilder } from "../services/default-executive-review-builder";
import { DefaultOperationsMonitor } from "../services/default-operations-monitor";
import { DefaultPriorityEngine } from "../services/default-priority-engine";
import { DefaultRoutinePlanner } from "../services/default-routine-planner";

export type CreateBusinessOperatingOptions = {
  dependencies?: Partial<BusinessOperatingDependencies>;
};

export function createBusinessOperating(
  options: CreateBusinessOperatingOptions = {},
): BusinessOperatingRuntimeService {
  const repository =
    options.dependencies?.repository ?? new InMemoryBusinessOperatingRepository();

  const healthAnalyzer =
    options.dependencies?.healthAnalyzer ?? new DefaultBusinessHealthAnalyzer(repository);

  const partialDeps: BusinessOperatingDependencies = {
    repository,
    dailyCoordinator:
      options.dependencies?.dailyCoordinator ?? new DefaultDailyCoordinator(repository),
    priorityEngine: options.dependencies?.priorityEngine ?? new DefaultPriorityEngine(repository),
    routinePlanner: options.dependencies?.routinePlanner ?? new DefaultRoutinePlanner(repository),
    operationsMonitor:
      options.dependencies?.operationsMonitor ?? new DefaultOperationsMonitor(repository),
    executiveReviewBuilder:
      options.dependencies?.executiveReviewBuilder ??
      new DefaultExecutiveReviewBuilder(repository, healthAnalyzer),
    healthAnalyzer,
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    agencyCore: options.dependencies?.agencyCore ?? new NoopAgencyCoreAdapter(),
    clientLifecycle: options.dependencies?.clientLifecycle ?? new NoopClientLifecycleAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveCouncil:
      options.dependencies?.executiveCouncil ?? new NoopExecutiveCouncilAdapter(),
    executiveMissions:
      options.dependencies?.executiveMissions ?? new NoopExecutiveMissionsAdapter(),
    executiveOpportunities:
      options.dependencies?.executiveOpportunities ?? new NoopExecutiveOpportunitiesAdapter(),
  };

  return new BusinessOperatingRuntimeService(partialDeps);
}
