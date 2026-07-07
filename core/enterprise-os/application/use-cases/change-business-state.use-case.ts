import { BusinessState, createBusinessStateChangedEvent } from "../../domain";
import type { ChangeBusinessStateDto } from "../dto";
import type { EnterpriseOsDependencies } from "../dependencies";

export class ChangeBusinessStateUseCase {
  constructor(private readonly deps: EnterpriseOsDependencies) {}

  async execute(dto: ChangeBusinessStateDto) {
    const existing = await this.deps.enterpriseRegistry.findState(dto.entityType, dto.entityId);

    const state = existing
      ? existing.transition(dto.newState)
      : BusinessState.create({
          organizationId: dto.organizationId,
          entityType: dto.entityType,
          entityId: dto.entityId,
          state: dto.newState,
          metadata: dto.metadata ?? {},
        });

    await this.deps.enterpriseRegistry.saveState(state);
    await this.deps.eventDispatcher.publish(createBusinessStateChangedEvent(state));
    await this.deps.enterpriseEventBus.broadcast(createBusinessStateChangedEvent(state));

    return state;
  }
}
