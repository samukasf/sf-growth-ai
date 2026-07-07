import type { AIProviderDependencies } from "../../application";
import { AIProviderService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopCompanyBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveReasoningAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryAIProviderRegistry } from "../persistence/in-memory-ai-provider-registry";
import { DefaultAIProviderFactory } from "../services/default-ai-provider-factory";
import { DefaultAIProviderHealthMonitor } from "../services/default-ai-provider-health-monitor";
import { DefaultAIProviderSelector } from "../services/default-ai-provider-selector";

export type CreateAIProviderOptions = {
  dependencies?: Partial<AIProviderDependencies>;
};

export function createAIProvider(
  options: CreateAIProviderOptions = {},
): AIProviderService {
  const registry = options.dependencies?.registry ?? new InMemoryAIProviderRegistry();
  const factory = options.dependencies?.factory ?? new DefaultAIProviderFactory();

  if (registry.getAll().length === 0) {
    for (const provider of factory.createAll()) {
      registry.register(provider);
    }
  }

  const dependencies: AIProviderDependencies = {
    registry,
    factory,
    selector: options.dependencies?.selector ?? new DefaultAIProviderSelector(),
    healthMonitor:
      options.dependencies?.healthMonitor ?? new DefaultAIProviderHealthMonitor(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveReasoning:
      options.dependencies?.executiveReasoning ?? new NoopExecutiveReasoningAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    softwareFactory:
      options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
  };

  return new AIProviderService(dependencies);
}
