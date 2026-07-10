import { ContextService } from "../context/context.service";
import { MemoryService } from "../memory/memory.service";
import type { MemoryRepository } from "../memory/memory.repository";
import type { ContextSourceProvider } from "../context/context.types";
import { ORCHESTRATOR_EVENTS, createOrchestratorEvent } from "./orchestrator.events";
import {
  createNoopCompanyBrainPort,
  createNoopExecutiveCouncilPort,
  executeOrchestratorPipeline,
} from "./orchestrator.pipeline";
import { createOrchestratorLogger, OrchestratorLogger } from "./orchestrator.logger";
import type {
  CompanyBrainPort,
  ExecutiveCouncilPort,
  LLMProviderPort,
  OrchestratorDependencies,
  OrchestratorResponse,
  UserMessage,
} from "./orchestrator.types";

export interface OrchestratorServiceOptions {
  memoryRepository: MemoryRepository;
  contextProviders?: ContextSourceProvider[];
  companyBrain?: CompanyBrainPort;
  executiveCouncil?: ExecutiveCouncilPort;
  llmProvider?: LLMProviderPort | null;
  logger?: OrchestratorLogger;
}

export class OrchestratorService {
  private readonly deps: OrchestratorDependencies;
  private readonly logger: OrchestratorLogger;

  constructor(options: OrchestratorServiceOptions) {
    const logger = options.logger ?? createOrchestratorLogger();
    this.logger = logger;

    this.deps = {
      memoryService: new MemoryService(options.memoryRepository),
      contextService: new ContextService(options.contextProviders ?? []),
      companyBrain: options.companyBrain ?? createNoopCompanyBrainPort(),
      executiveCouncil: options.executiveCouncil ?? createNoopExecutiveCouncilPort(),
      llmProvider: options.llmProvider ?? null,
      logger,
    };
  }

  async processMessage(input: Omit<UserMessage, "id" | "receivedAt"> & {
    id?: string;
    receivedAt?: string;
  }): Promise<OrchestratorResponse> {
    const message: UserMessage = {
      id: input.id ?? `msg-${Date.now()}`,
      receivedAt: input.receivedAt ?? new Date().toISOString(),
      tenantId: input.tenantId,
      companyId: input.companyId,
      userId: input.userId,
      content: input.content,
      sessionId: input.sessionId,
    };

    this.logger.log({
      level: "info",
      message: ORCHESTRATOR_EVENTS.STARTED,
      tenantId: message.tenantId,
      companyId: message.companyId,
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await executeOrchestratorPipeline(message, this.deps);

      this.logger.log({
        level: "info",
        message: ORCHESTRATOR_EVENTS.COMPLETED,
        tenantId: message.tenantId,
        companyId: message.companyId,
        result: {
          responseId: response.id,
          confidence: response.confidence,
          stepCount: response.steps.length,
        },
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.log({
        level: "error",
        message: ORCHESTRATOR_EVENTS.FAILED,
        tenantId: message.tenantId,
        companyId: message.companyId,
        result: { error: errorMessage },
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  getLogger(): OrchestratorLogger {
    return this.logger;
  }

  /** Hook for future LLM integration — not invoked until a provider is connected. */
  async completeWithLLM(
    response: OrchestratorResponse,
  ): Promise<OrchestratorResponse> {
    if (!this.deps.llmProvider) {
      return response;
    }

    const completion = await this.deps.llmProvider.complete({
      payload: response.runtime.llmPayload,
    });

    return {
      ...response,
      generatedText: completion.content,
    };
  }
}

export { createOrchestratorEvent, ORCHESTRATOR_EVENTS };
