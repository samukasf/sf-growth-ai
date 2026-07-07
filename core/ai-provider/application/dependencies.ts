import type { EventDispatcher } from "../shared";
import type {
  AIProviderFactory,
  AIProviderHealthMonitor,
  AIProviderRegistry,
  AIProviderSelector,
} from "../domain";
import type {
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
  ExecutiveReasoningPort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type AIProviderDependencies = {
  registry: AIProviderRegistry;
  factory: AIProviderFactory;
  selector: AIProviderSelector;
  healthMonitor: AIProviderHealthMonitor;
  eventDispatcher: EventDispatcher;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  executiveCeo: ExecutiveCEOPort;
  executiveReasoning: ExecutiveReasoningPort;
  companyBrain: CompanyBrainPort;
  softwareFactory: SoftwareFactoryPort;
};
