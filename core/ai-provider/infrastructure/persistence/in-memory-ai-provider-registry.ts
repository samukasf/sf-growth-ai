import type { AIProvider } from "../../domain/ports/ai-provider.port";
import type {
  AIProviderMetrics,
  AIRequest,
  AIResponse,
  AITokenUsage,
  AIUsage,
} from "../../domain/entities";
import type { AIProviderRegistry } from "../../domain/ports/ai-provider-registry.port";
import type { OrganizationId } from "../../shared";

export class InMemoryAIProviderRegistry implements AIProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();
  private readonly requests = new Map<string, AIRequest>();
  private readonly responses = new Map<string, AIResponse>();
  private readonly usages = new Map<string, AIUsage>();
  private readonly tokenUsages = new Map<string, AITokenUsage>();
  private readonly metrics = new Map<string, AIProviderMetrics>();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  get(providerId: string): AIProvider | null {
    return this.providers.get(providerId) ?? null;
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getByType(type: string): AIProvider[] {
    return this.getAll().filter((provider) => provider.type === type);
  }

  getAvailable(): AIProvider[] {
    return this.getAll().filter((provider) => provider.isAvailable());
  }

  async saveRequest(request: AIRequest): Promise<void> {
    this.requests.set(request.id, request);
  }

  async findRequestById(id: string): Promise<AIRequest | null> {
    return this.requests.get(id) ?? null;
  }

  async saveResponse(response: AIResponse): Promise<void> {
    this.responses.set(response.id, response);
  }

  async saveUsage(usage: AIUsage): Promise<void> {
    this.usages.set(`${usage.organizationId}:${usage.providerId}`, usage);
  }

  async findUsageByProvider(
    providerId: string,
    organizationId: OrganizationId,
  ): Promise<AIUsage | null> {
    return this.usages.get(`${organizationId}:${providerId}`) ?? null;
  }

  async saveTokenUsage(tokenUsage: AITokenUsage): Promise<void> {
    this.tokenUsages.set(tokenUsage.id, tokenUsage);
  }

  async saveMetrics(providerMetrics: AIProviderMetrics): Promise<void> {
    this.metrics.set(providerMetrics.providerId, providerMetrics);
  }

  async findMetricsByProvider(providerId: string): Promise<AIProviderMetrics | null> {
    return this.metrics.get(providerId) ?? null;
  }
}
