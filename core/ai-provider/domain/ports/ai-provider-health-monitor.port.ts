import type { AIProvider } from "./ai-provider.port";
import type { AIProviderMetrics } from "../entities";
import type { HealthScore } from "../../shared";

export type ProviderHealthReport = {
  providerId: string;
  providerName: string;
  score: HealthScore;
  available: boolean;
  checkedAt: string;
};

export interface AIProviderHealthMonitor {
  check(provider: AIProvider): ProviderHealthReport;
  toMetrics(
    provider: AIProvider,
    report: ProviderHealthReport,
    organizationId: string,
  ): AIProviderMetrics;
  checkAll(providers: AIProvider[]): ProviderHealthReport[];
}
