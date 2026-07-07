import { AIProviderMetrics } from "../../domain/entities/ai-provider-metrics";
import type {
  AIProviderHealthMonitor,
  ProviderHealthReport,
} from "../../domain/ports/ai-provider-health-monitor.port";
import type { AIProvider } from "../../domain/ports/ai-provider.port";
import type { HealthScore } from "../../shared";

export class DefaultAIProviderHealthMonitor implements AIProviderHealthMonitor {
  check(provider: AIProvider): ProviderHealthReport {
    const available = provider.isAvailable();
    const score: HealthScore = available
      ? { value: 0.95, status: "healthy" }
      : { value: 0, status: "unavailable" };

    return {
      providerId: provider.id,
      providerName: provider.name,
      score,
      available,
      checkedAt: new Date().toISOString(),
    };
  }

  toMetrics(
    provider: AIProvider,
    report: ProviderHealthReport,
    organizationId: string,
  ): AIProviderMetrics {
    return AIProviderMetrics.create({
      organizationId,
      providerId: provider.id,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: report.available ? 0 : 1,
      averageLatencyMs: 0,
      totalTokens: 0,
      totalCost: 0,
      currency: "USD",
      healthStatus: report.score.status,
    });
  }

  checkAll(providers: AIProvider[]): ProviderHealthReport[] {
    return providers.map((provider) => this.check(provider));
  }
}
