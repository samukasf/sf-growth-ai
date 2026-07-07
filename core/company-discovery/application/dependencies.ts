import type { EventDispatcher } from "../shared";
import type {
  BusinessProfiler,
  DiscoveryAnalyzer,
  DiscoveryCoordinator,
  DiscoveryReporter,
  DiscoveryRepository,
  DiscoverySourceProvider,
  GapAnalyzer,
  OpportunityDetector,
} from "../domain";
import type {
  EnterpriseBrainPort,
  ExecutiveInnovationPort,
  ExecutiveKnowledgePort,
  ExecutiveMemoryPort,
  ExecutiveProjectGeneratorPort,
  OrganizationBrainPort,
} from "./ports/integration";

export type CompanyDiscoveryDependencies = {
  repository: DiscoveryRepository;
  coordinator: DiscoveryCoordinator;
  analyzer: DiscoveryAnalyzer;
  profiler: BusinessProfiler;
  gapAnalyzer: GapAnalyzer;
  opportunityDetector: OpportunityDetector;
  reporter: DiscoveryReporter;
  sourceProviders: DiscoverySourceProvider[];
  eventDispatcher: EventDispatcher;
  enterpriseBrain: EnterpriseBrainPort;
  organizationBrain: OrganizationBrainPort;
  executiveMemory: ExecutiveMemoryPort;
  executiveKnowledge: ExecutiveKnowledgePort;
  executiveInnovation: ExecutiveInnovationPort;
  executiveProjectGenerator: ExecutiveProjectGeneratorPort;
};
