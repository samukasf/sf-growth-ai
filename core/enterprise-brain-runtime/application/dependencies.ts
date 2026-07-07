import type { EventDispatcher } from "../shared";
import type {
  BrainDataSources,
  BrainRepository,
  EnterpriseBrainContextBuilder,
  EnterpriseBrainHealthAnalyzer,
  EnterpriseBrainRelationshipMapper,
  EnterpriseBrainSignalProcessor,
  EnterpriseBrainSnapshotBuilder,
  EnterpriseBrainStateManager,
  EnterpriseBrainSummaryBuilder,
} from "../domain";
import type {
  AIProviderPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
  ExecutiveReasoningPort,
  MarketplacePort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type EnterpriseBrainRuntimeDependencies = {
  repository: BrainRepository;
  dataSources: BrainDataSources;
  contextBuilder: EnterpriseBrainContextBuilder;
  snapshotBuilder: EnterpriseBrainSnapshotBuilder;
  healthAnalyzer: EnterpriseBrainHealthAnalyzer;
  signalProcessor: EnterpriseBrainSignalProcessor;
  relationshipMapper: EnterpriseBrainRelationshipMapper;
  summaryBuilder: EnterpriseBrainSummaryBuilder;
  stateManager: EnterpriseBrainStateManager;
  eventDispatcher: EventDispatcher;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  executiveReasoning: ExecutiveReasoningPort;
  executiveCeo: ExecutiveCEOPort;
  aiProvider: AIProviderPort;
  softwareFactory: SoftwareFactoryPort;
  marketplace: MarketplacePort;
};
