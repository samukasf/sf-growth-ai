import type { CompanyDiscoveryDependencies } from "../../application";
import { CompanyDiscoveryEngineService } from "../../application";
import { PREPARED_DISCOVERY_SOURCES } from "../data-sources";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopEnterpriseBrainAdapter,
  NoopExecutiveInnovationAdapter,
  NoopExecutiveKnowledgeAdapter,
  NoopExecutiveMemoryAdapter,
  NoopExecutiveProjectGeneratorAdapter,
  NoopOrganizationBrainAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryDiscoveryRepository } from "../persistence/in-memory-discovery.repository";
import { DefaultBusinessProfiler } from "../services/default-business-profiler";
import { DefaultDiscoveryAnalyzer } from "../services/default-discovery-analyzer";
import { DefaultDiscoveryCoordinator } from "../services/default-discovery-coordinator";
import { DefaultDiscoveryReporter } from "../services/default-discovery-reporter";
import { DefaultGapAnalyzer } from "../services/default-gap-analyzer";
import { DefaultOpportunityDetector } from "../services/default-opportunity-detector";

export type CreateCompanyDiscoveryOptions = {
  dependencies?: Partial<CompanyDiscoveryDependencies>;
};

export function createCompanyDiscovery(
  options: CreateCompanyDiscoveryOptions = {},
): CompanyDiscoveryEngineService {
  const dependencies: CompanyDiscoveryDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryDiscoveryRepository(),
    coordinator: options.dependencies?.coordinator ?? new DefaultDiscoveryCoordinator(),
    analyzer: options.dependencies?.analyzer ?? new DefaultDiscoveryAnalyzer(),
    profiler: options.dependencies?.profiler ?? new DefaultBusinessProfiler(),
    gapAnalyzer: options.dependencies?.gapAnalyzer ?? new DefaultGapAnalyzer(),
    opportunityDetector:
      options.dependencies?.opportunityDetector ?? new DefaultOpportunityDetector(),
    reporter: options.dependencies?.reporter ?? new DefaultDiscoveryReporter(),
    sourceProviders: options.dependencies?.sourceProviders ?? PREPARED_DISCOVERY_SOURCES,
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    organizationBrain:
      options.dependencies?.organizationBrain ?? new NoopOrganizationBrainAdapter(),
    executiveMemory: options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveKnowledge:
      options.dependencies?.executiveKnowledge ?? new NoopExecutiveKnowledgeAdapter(),
    executiveInnovation:
      options.dependencies?.executiveInnovation ?? new NoopExecutiveInnovationAdapter(),
    executiveProjectGenerator:
      options.dependencies?.executiveProjectGenerator ??
      new NoopExecutiveProjectGeneratorAdapter(),
  };

  return new CompanyDiscoveryEngineService(dependencies);
}
