import type { EventDispatcher } from "../shared";
import type {
  MemoryIndexer,
  MemoryLifecycleManager,
  MemoryReader,
  MemoryRelationshipEngine,
  MemoryRepository,
  MemoryRetentionEngine,
  MemorySearchEngine,
  MemoryWriter,
} from "../domain";
import type {
  AIProviderPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
  ExecutiveReasoningPort,
  OrganizationBrainPort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type EnterpriseMemoryRuntimeDependencies = {
  repository: MemoryRepository;
  writer: MemoryWriter;
  reader: MemoryReader;
  indexer: MemoryIndexer;
  relationshipEngine: MemoryRelationshipEngine;
  retentionEngine: MemoryRetentionEngine;
  searchEngine: MemorySearchEngine;
  lifecycleManager: MemoryLifecycleManager;
  eventDispatcher: EventDispatcher;
  aiProvider: AIProviderPort;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  executiveReasoning: ExecutiveReasoningPort;
  executiveCeo: ExecutiveCEOPort;
  enterpriseBrain: EnterpriseBrainPort;
  organizationBrain: OrganizationBrainPort;
  softwareFactory: SoftwareFactoryPort;
};
