import { createAIProviderChangedEvent } from "../../domain";
import { AIProviderNotFoundError } from "../../shared";
import type { SwitchProviderDto } from "../dto";
import type { AIProviderDependencies } from "../dependencies";

export class SwitchProviderUseCase {
  constructor(
    private readonly deps: AIProviderDependencies,
    private readonly activeProviderByOrg: Map<string, string>,
  ) {}

  async execute(dto: SwitchProviderDto) {
    const provider = this.deps.registry.get(dto.providerId);
    if (!provider) {
      throw new AIProviderNotFoundError(dto.providerId);
    }

    const previousProviderId =
      this.activeProviderByOrg.get(dto.organizationId) ?? "none";

    this.activeProviderByOrg.set(dto.organizationId, dto.providerId);

    await this.deps.eventDispatcher.publish(
      createAIProviderChangedEvent({
        organizationId: dto.organizationId,
        previousProviderId,
        newProviderId: dto.providerId,
        reason: dto.reason ?? "Manual provider switch",
      }),
    );

    return { providerId: dto.providerId, providerName: provider.name };
  }
}
