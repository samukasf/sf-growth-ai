import type { AIProvider } from "./ai-provider.port";
import type { AIProviderMetrics, AIRequest, AIResponse, AITokenUsage, AIUsage } from "../entities";
import type { OrganizationId } from "../../shared";

export interface AIProviderRegistry {
  register(provider: AIProvider): void;
  unregister(providerId: string): void;
  get(providerId: string): AIProvider | null;
  getAll(): AIProvider[];
  getByType(type: string): AIProvider[];
  getAvailable(): AIProvider[];
  saveRequest(request: AIRequest): Promise<void>;
  findRequestById(id: string): Promise<AIRequest | null>;
  saveResponse(response: AIResponse): Promise<void>;
  saveUsage(usage: AIUsage): Promise<void>;
  findUsageByProvider(providerId: string, organizationId: OrganizationId): Promise<AIUsage | null>;
  saveTokenUsage(tokenUsage: AITokenUsage): Promise<void>;
  saveMetrics(metrics: AIProviderMetrics): Promise<void>;
  findMetricsByProvider(providerId: string): Promise<AIProviderMetrics | null>;
}
