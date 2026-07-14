import type { EnterpriseBrainRuntimeDependencies } from "../../application";
import { EnterpriseBrainRuntimeService } from "../../application";
import type { DataSourceAdapter } from "../data-sources/aggregated-brain-data-sources";
import { AggregatedBrainDataSources } from "../data-sources/aggregated-brain-data-sources";
import { DEFAULT_DATA_SOURCE_ADAPTERS } from "../data-sources/default-data-source-adapters";
import { SUPABASE_DATA_SOURCE_ADAPTERS } from "../data-sources/supabase-data-source-adapters";
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

/**
 * Kill-switch da Sprint 84 (Company Brain Data Providers): desliga os
 * adapters reais do Supabase sem deploy, revertendo instantaneamente para os
 * 14 adapters simulados originais.
 */
function isRealDataSourcesEnabled(): boolean {
  return process.env.COMPANY_BRAIN_REAL_DATA_SOURCES_ENABLED !== "false";
}

/**
 * Combina os adapters reais (company, enterprise_memory, crm) com os
 * simulados que ainda não têm uma tabela real correspondente. Os adapters
 * reais substituem os simulados de mesma `key` — nenhum domínio é
 * duplicado ou perdido.
 */
function buildDefaultDataSourceAdapters(): DataSourceAdapter[] {
  if (!isRealDataSourcesEnabled()) {
    return DEFAULT_DATA_SOURCE_ADAPTERS;
  }

  const realKeys = new Set(SUPABASE_DATA_SOURCE_ADAPTERS.map((adapter) => adapter.key));
  const remainingSimulatedAdapters = DEFAULT_DATA_SOURCE_ADAPTERS.filter(
    (adapter) => !realKeys.has(adapter.key),
  );

  return [...SUPABASE_DATA_SOURCE_ADAPTERS, ...remainingSimulatedAdapters];
}

export function createEnterpriseBrainRuntime(
  options: CreateEnterpriseBrainRuntimeOptions = {},
): EnterpriseBrainRuntimeService {
  const repository = options.dependencies?.repository ?? new InMemoryBrainRepository();

  const dependencies: EnterpriseBrainRuntimeDependencies = {
    repository,
    dataSources:
      options.dependencies?.dataSources ??
      new AggregatedBrainDataSources(buildDefaultDataSourceAdapters()),
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
