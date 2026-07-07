import type { AIProvider } from "../../domain/ports/ai-provider.port";
import {
  createAIProviderRecoveredEvent,
  createAIProviderUnavailableEvent,
} from "../../domain";
import type { CheckProviderHealthDto } from "../dto";
import type { AIProviderDependencies } from "../dependencies";

export class CheckProviderHealthUseCase {
  constructor(private readonly deps: AIProviderDependencies) {}

  async execute(dto: CheckProviderHealthDto) {
    const providers: AIProvider[] = dto.providerId
      ? (() => {
          const provider = this.deps.registry.get(dto.providerId);
          return provider ? [provider] : [];
        })()
      : this.deps.registry.getAll();

    const reports = this.deps.healthMonitor.checkAll(providers);

    for (const report of reports) {
      const metrics = this.deps.healthMonitor.toMetrics(
        this.deps.registry.get(report.providerId)!,
        report,
        dto.organizationId,
      );
      await this.deps.registry.saveMetrics(metrics);

      if (!report.available) {
        await this.deps.eventDispatcher.publish(
          createAIProviderUnavailableEvent({
            organizationId: dto.organizationId,
            providerId: report.providerId,
            providerType: this.deps.registry.get(report.providerId)?.type ?? "custom",
            reason: `Health score: ${report.score.status}`,
          }),
        );
      } else if (report.score.status === "healthy" || report.score.status === "optimal") {
        await this.deps.eventDispatcher.publish(
          createAIProviderRecoveredEvent({
            organizationId: dto.organizationId,
            providerId: report.providerId,
            providerType: this.deps.registry.get(report.providerId)?.type ?? "custom",
          }),
        );
      }
    }

    return { reports };
  }
}
