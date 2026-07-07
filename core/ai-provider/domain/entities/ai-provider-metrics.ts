import type { AIProviderId, AIProviderMetricsId, OrganizationId } from "../../shared";

export type ProviderHealthStatus = "unavailable" | "degraded" | "healthy" | "optimal";

export type AIProviderMetricsProps = {
  id: AIProviderMetricsId;
  organizationId: OrganizationId;
  providerId: AIProviderId;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  totalTokens: number;
  totalCost: number;
  currency: string;
  healthStatus: ProviderHealthStatus;
  lastCheckedAt: string;
};

export class AIProviderMetrics {
  readonly id: AIProviderMetricsId;
  readonly organizationId: OrganizationId;
  readonly providerId: AIProviderId;
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly averageLatencyMs: number;
  readonly totalTokens: number;
  readonly totalCost: number;
  readonly currency: string;
  readonly healthStatus: ProviderHealthStatus;
  readonly lastCheckedAt: string;

  private constructor(props: AIProviderMetricsProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.providerId = props.providerId;
    this.totalRequests = props.totalRequests;
    this.successfulRequests = props.successfulRequests;
    this.failedRequests = props.failedRequests;
    this.averageLatencyMs = props.averageLatencyMs;
    this.totalTokens = props.totalTokens;
    this.totalCost = props.totalCost;
    this.currency = props.currency;
    this.healthStatus = props.healthStatus;
    this.lastCheckedAt = props.lastCheckedAt;
  }

  static create(
    props: Omit<AIProviderMetricsProps, "id" | "lastCheckedAt"> & {
      id?: AIProviderMetricsId;
      lastCheckedAt?: string;
    },
  ): AIProviderMetrics {
    return new AIProviderMetrics({
      id: props.id ?? `metrics-${Date.now()}`,
      organizationId: props.organizationId,
      providerId: props.providerId,
      totalRequests: props.totalRequests,
      successfulRequests: props.successfulRequests,
      failedRequests: props.failedRequests,
      averageLatencyMs: props.averageLatencyMs,
      totalTokens: props.totalTokens,
      totalCost: props.totalCost,
      currency: props.currency,
      healthStatus: props.healthStatus,
      lastCheckedAt: props.lastCheckedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AIProviderMetricsProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      providerId: this.providerId,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      averageLatencyMs: this.averageLatencyMs,
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
      currency: this.currency,
      healthStatus: this.healthStatus,
      lastCheckedAt: this.lastCheckedAt,
    };
  }
}
