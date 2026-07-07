import type { EnterpriseMemoryRuntimeDependencies } from "../../application";
import { EnterpriseMemoryRuntimeService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopAIProviderAdapter,
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveReasoningAdapter,
  NoopOrganizationBrainAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryMemoryRepository } from "../persistence/in-memory-memory.repository";
import { DefaultMemoryIndexer } from "../services/default-memory-indexer";
import { DefaultMemoryLifecycleManager } from "../services/default-memory-lifecycle-manager";
import { DefaultMemoryReader } from "../services/default-memory-reader";
import { DefaultMemoryRelationshipEngine } from "../services/default-memory-relationship-engine";
import { DefaultMemoryRetentionEngine } from "../services/default-memory-retention-engine";
import { DefaultMemorySearchEngine } from "../services/default-memory-search-engine";
import { DefaultMemoryWriter } from "../services/default-memory-writer";

export type CreateEnterpriseMemoryRuntimeOptions = {
  dependencies?: Partial<EnterpriseMemoryRuntimeDependencies>;
};

export function createEnterpriseMemoryRuntime(
  options: CreateEnterpriseMemoryRuntimeOptions = {},
): EnterpriseMemoryRuntimeService {
  const repository = options.dependencies?.repository ?? new InMemoryMemoryRepository();

  const dependencies: EnterpriseMemoryRuntimeDependencies = {
    repository,
    writer: options.dependencies?.writer ?? new DefaultMemoryWriter(repository),
    reader: options.dependencies?.reader ?? new DefaultMemoryReader(repository),
    indexer: options.dependencies?.indexer ?? new DefaultMemoryIndexer(repository),
    relationshipEngine:
      options.dependencies?.relationshipEngine ?? new DefaultMemoryRelationshipEngine(repository),
    retentionEngine:
      options.dependencies?.retentionEngine ?? new DefaultMemoryRetentionEngine(),
    searchEngine: options.dependencies?.searchEngine ?? new DefaultMemorySearchEngine(repository),
    lifecycleManager:
      options.dependencies?.lifecycleManager ?? new DefaultMemoryLifecycleManager(repository),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    aiProvider: options.dependencies?.aiProvider ?? new NoopAIProviderAdapter(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    executiveReasoning:
      options.dependencies?.executiveReasoning ?? new NoopExecutiveReasoningAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    organizationBrain:
      options.dependencies?.organizationBrain ?? new NoopOrganizationBrainAdapter(),
    softwareFactory: options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
  };

  return new EnterpriseMemoryRuntimeService(dependencies);
}
