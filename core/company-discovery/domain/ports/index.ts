export type { DiscoveryRepository } from "./discovery-repository.port";
export type {
  DiscoverySourceProvider,
  SourceCollectionInput,
  SourceCollectionResult,
} from "./discovery-source-provider.port";
export type {
  DiscoveryCoordinator,
  CoordinateDiscoveryInput,
  CoordinateDiscoveryResult,
} from "./discovery-coordinator.port";
export type {
  DiscoveryAnalyzer,
  AnalyzeFindingsInput,
  AnalyzeFindingsResult,
} from "./discovery-analyzer.port";
export type { BusinessProfiler, BuildProfileInput } from "./business-profiler.port";
export type { GapAnalyzer, AnalyzeGapsInput } from "./gap-analyzer.port";
export type {
  OpportunityDetector,
  DetectOpportunitiesInput,
} from "./opportunity-detector.port";
export type {
  DiscoveryReporter,
  DiscoveryReport,
  GenerateReportInput,
} from "./discovery-reporter.port";
export type {
  CompanyDiscoveryEngine,
  StartDiscoveryInput,
  StartDiscoveryResult,
  RunDiscoveryInput,
  RunDiscoveryResult,
} from "./company-discovery-engine.port";
