export { InMemoryDiscoveryRepository } from "./persistence/in-memory-discovery.repository";
export { InMemoryEventBus } from "./events/in-memory-event-bus";
export { DefaultDiscoveryCoordinator } from "./services/default-discovery-coordinator";
export { DefaultDiscoveryAnalyzer } from "./services/default-discovery-analyzer";
export { DefaultBusinessProfiler } from "./services/default-business-profiler";
export { DefaultGapAnalyzer } from "./services/default-gap-analyzer";
export { DefaultOpportunityDetector } from "./services/default-opportunity-detector";
export { DefaultDiscoveryReporter } from "./services/default-discovery-reporter";
export { PREPARED_DISCOVERY_SOURCES } from "./data-sources";
export {
  NoopEnterpriseBrainAdapter,
  NoopOrganizationBrainAdapter,
  NoopExecutiveMemoryAdapter,
  NoopExecutiveKnowledgeAdapter,
  NoopExecutiveInnovationAdapter,
  NoopExecutiveProjectGeneratorAdapter,
} from "./integration/noop-integration.adapters";
export {
  createCompanyDiscovery,
  type CreateCompanyDiscoveryOptions,
} from "./factories/create-company-discovery";
