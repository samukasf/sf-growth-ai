import type { EnterpriseBrainRuntimeDependencies } from "../../application";
import { EnterpriseBrainRuntimeService } from "../../application";
import { AggregatedBrainDataSources } from "../data-sources/aggregated-brain-data-sources";
import { DEFAULT_DATA_SOURCE_ADAPTERS } from "../data-sources/default-data-source-adapters";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopAIProviderAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveReasoningAdapter,
  NoopMarketplaceAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryBrainRepository } from "../persistence/in-memory-brain.repository";
import { DefaultEnterpriseBrainContextBuilder } from "../services/default-context-builder";
import { DefaultEnterpriseBrainHealthAnalyzer } from "../services/default-health-analyzer";
import { DefaultEnterpriseBrainRelationshipMapper } from "../services/default-relationship-mapper";
import { DefaultEnterpriseBrainSignalProcessor } from "../services/default-signal-processor";
import { DefaultEnterpriseBrainSnapshotBuilder } from "../services/default-snapshot-builder";
import { DefaultEnterpriseBrainStateManager } from "../services/default-state-manager";
import { DefaultEnterpriseBrainSummaryBuilder } from "../services/default-summary-builder";

export type CreateEnterpriseBrainRuntimeOptions = {
  dependencies?: Partial<EnterpriseBrainRuntimeDependencies>;
};

export function createEnterpriseBrainRuntime(
  options: CreateEnterpriseBrainRuntimeOptions = {},
): EnterpriseBrainRuntimeService {
  const repository = options.dependencies?.repository ?? new InMemoryBrainRepository();

  const dependencies: EnterpriseBrainRuntimeDependencies = {
    repository,
    dataSources:
      options.dependencies?.dataSources ??
      new AggregatedBrainDataSources(DEFAULT_DATA_SOURCE_ADAPTERS),
    contextBuilder:
      options.dependencies?.contextBuilder ?? new DefaultEnterpriseBrainContextBuilder(),
    snapshotBuilder:
      options.dependencies?.snapshotBuilder ?? new DefaultEnterpriseBrainSnapshotBuilder(),
    healthAnalyzer:
      options.dependencies?.healthAnalyzer ?? new DefaultEnterpriseBrainHealthAnalyzer(),
    signalProcessor:
      options.dependencies?.signalProcessor ?? new DefaultEnterpriseBrainSignalProcessor(),
    relationshipMapper:
      options.dependencies?.relationshipMapper ?? new DefaultEnterpriseBrainRelationshipMapper(),
    summaryBuilder:
      options.dependencies?.summaryBuilder ?? new DefaultEnterpriseBrainSummaryBuilder(),
    stateManager:
      options.dependencies?.stateManager ?? new DefaultEnterpriseBrainStateManager(repository),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    executiveReasoning:
      options.dependencies?.executiveReasoning ?? new NoopExecutiveReasoningAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    aiProvider: options.dependencies?.aiProvider ?? new NoopAIProviderAdapter(),
    softwareFactory: options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
    marketplace: options.dependencies?.marketplace ?? new NoopMarketplaceAdapter(),
  };

  return new EnterpriseBrainRuntimeService(dependencies);
}
