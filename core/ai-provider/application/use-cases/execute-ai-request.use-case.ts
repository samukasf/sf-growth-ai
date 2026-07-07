import {
  AIProviderMetrics,
  AIRequest,
  AIResponse,
  AITokenUsage,
  AIUsage,
  createAIRequestCompletedEvent,
  createAIRequestStartedEvent,
  createAIProviderUnavailableEvent,
} from "../../domain";
import type {
  AIClassifyInput,
  AIProvider,
  AIProviderInput,
  AIStructuredInput,
  AITranslateInput,
} from "../../domain/ports/ai-provider.port";
import { AIProviderNotFoundError, AIUsageLimitExceededError } from "../../shared";
import type { ExecuteAIRequestDto } from "../dto";
import type { AIProviderDependencies } from "../dependencies";

const PROVIDER_COST_PER_1K_TOKENS: Record<string, number> = {
  openai: 0.03,
  anthropic: 0.025,
  gemini: 0.02,
  local: 0,
  azure_openai: 0.028,
  aws_bedrock: 0.022,
  custom: 0.015,
};

export class ExecuteAIRequestUseCase {
  constructor(
    private readonly deps: AIProviderDependencies,
    private readonly activeProviderByOrg: Map<string, string>,
  ) {}

  async execute(dto: ExecuteAIRequestDto) {
    const providers = this.deps.registry.getAll();
    const activeProviderId = this.activeProviderByOrg.get(dto.organizationId);

    const selection = this.deps.selector.selectWithFallback(providers, {
      preferredProviderId: dto.preferredProviderId ?? activeProviderId,
      preferredType: dto.preferredType,
      operation: dto.operation,
      enableFallback: dto.enableFallback ?? true,
    });

    if (!selection) {
      throw new AIProviderNotFoundError("no available provider");
    }

    const { provider, fallbackUsed } = selection;

    const existingUsage = await this.deps.registry.findUsageByProvider(
      provider.id,
      dto.organizationId,
    );
    if (existingUsage?.limitReached) {
      throw new AIUsageLimitExceededError(
        `Usage limit reached for provider: ${provider.id}`,
      );
    }

    let prompt = dto.prompt;
    if (this.deps.executiveCeo.isAvailable() && this.deps.executiveCeo.enrichPrompt) {
      prompt = await this.deps.executiveCeo.enrichPrompt({
        organizationId: dto.organizationId,
        prompt,
        context: dto.context,
      });
    }

    let context = { ...dto.context };
    if (this.deps.companyBrain.isAvailable() && this.deps.companyBrain.enrichContext) {
      const brainContext = await this.deps.companyBrain.enrichContext({
        organizationId: dto.organizationId,
        prompt,
      });
      context = { ...context, ...brainContext };
    }

    if (
      dto.operation === "reason" &&
      this.deps.executiveReasoning.isAvailable() &&
      this.deps.executiveReasoning.prepareReasoningContext
    ) {
      const reasoningContext = await this.deps.executiveReasoning.prepareReasoningContext({
        organizationId: dto.organizationId,
        prompt,
      });
      context = { ...context, ...reasoningContext };
    }

    const request = AIRequest.create({
      organizationId: dto.organizationId,
      providerId: provider.id,
      providerType: provider.type,
      operation: dto.operation,
      model: dto.model ?? "default",
      prompt,
      context,
    });

    await this.deps.registry.saveRequest(request);
    await this.deps.eventDispatcher.publish(createAIRequestStartedEvent(request));

    if (!provider.isAvailable()) {
      await this.deps.eventDispatcher.publish(
        createAIProviderUnavailableEvent({
          organizationId: dto.organizationId,
          providerId: provider.id,
          providerType: provider.type,
          reason: "Provider marked unavailable",
        }),
      );
      throw new AIProviderNotFoundError(provider.id);
    }

    const baseInput: AIProviderInput = {
      organizationId: dto.organizationId,
      model: dto.model,
      prompt,
      context,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
    };

    const result = await this.runOperation(provider, dto, baseInput);

    const response = AIResponse.create({
      organizationId: dto.organizationId,
      requestId: request.id,
      content:
        typeof result.content === "string" ? result.content : JSON.stringify(result.content),
      structuredOutput: result.structuredOutput,
      finishReason: result.finishReason,
      latencyMs: result.latencyMs,
    });

    const costPer1k = PROVIDER_COST_PER_1K_TOKENS[provider.type] ?? 0.02;
    const totalTokens = result.promptTokens + result.completionTokens;
    const estimatedCost = (totalTokens / 1000) * costPer1k;

    const tokenUsage = AITokenUsage.create({
      organizationId: dto.organizationId,
      requestId: request.id,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      estimatedCost,
      currency: "USD",
    });

    const completedRequest = request.complete();
    await this.deps.registry.saveRequest(completedRequest);
    await this.deps.registry.saveResponse(response);
    await this.deps.registry.saveTokenUsage(tokenUsage);

    const updatedUsage = (existingUsage ?? this.createInitialUsage(dto.organizationId, provider.id))
      .increment(totalTokens, estimatedCost);
    await this.deps.registry.saveUsage(updatedUsage);

    const existingMetrics = await this.deps.registry.findMetricsByProvider(provider.id);
    const healthReport = this.deps.healthMonitor.check(provider);
    const baseMetrics = this.deps.healthMonitor.toMetrics(
      provider,
      healthReport,
      dto.organizationId,
    );

    const updatedMetrics = existingMetrics
      ? AIProviderMetrics.create({
          ...existingMetrics.toJSON(),
          totalRequests: existingMetrics.totalRequests + 1,
          successfulRequests: existingMetrics.successfulRequests + 1,
          averageLatencyMs: Math.round(
            (existingMetrics.averageLatencyMs * existingMetrics.totalRequests +
              result.latencyMs) /
              (existingMetrics.totalRequests + 1),
          ),
          totalTokens: existingMetrics.totalTokens + totalTokens,
          totalCost: existingMetrics.totalCost + estimatedCost,
          healthStatus: baseMetrics.healthStatus,
        })
      : AIProviderMetrics.create({
          ...baseMetrics.toJSON(),
          totalRequests: 1,
          successfulRequests: 1,
          failedRequests: 0,
          averageLatencyMs: result.latencyMs,
          totalTokens,
          totalCost: estimatedCost,
        });

    await this.deps.registry.saveMetrics(updatedMetrics);

    await this.deps.eventDispatcher.publish(
      createAIRequestCompletedEvent(completedRequest, response),
    );

    if (this.deps.executiveOrchestrator.isAvailable()) {
      await this.deps.executiveOrchestrator.notifyRequestCompleted?.({
        organizationId: dto.organizationId,
        requestId: request.id,
        operation: dto.operation,
      });
    }

    if (this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.notifyCodeGeneration?.({
        organizationId: dto.organizationId,
        requestId: request.id,
        operation: dto.operation,
      });
    }

    return {
      request: completedRequest,
      response,
      tokenUsage,
      providerId: provider.id,
      fallbackUsed,
    };
  }

  private createInitialUsage(organizationId: string, providerId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    return AIUsage.create({
      organizationId,
      providerId,
      requestCount: 0,
      tokenCount: 0,
      costAmount: 0,
      currency: "USD",
      periodStart,
      periodEnd,
      limitReached: false,
    });
  }

  private runOperation(provider: AIProvider, dto: ExecuteAIRequestDto, baseInput: AIProviderInput) {
    switch (dto.operation) {
      case "generateText":
        return provider.generateText(baseInput);
      case "generateStructuredOutput":
        return provider.generateStructuredOutput({
          ...baseInput,
          schema: dto.schema ?? {},
        } satisfies AIStructuredInput);
      case "summarize":
        return provider.summarize(baseInput);
      case "classify":
        return provider.classify({
          ...baseInput,
          categories: dto.categories ?? [],
        } satisfies AIClassifyInput);
      case "extractEntities":
        return provider.extractEntities(baseInput);
      case "analyze":
        return provider.analyze(baseInput);
      case "translate":
        return provider.translate({
          ...baseInput,
          targetLanguage: dto.targetLanguage ?? "en",
          sourceLanguage: dto.sourceLanguage,
        } satisfies AITranslateInput);
      case "reason":
        return provider.reason(baseInput);
      default:
        return provider.generateText(baseInput);
    }
  }
}
