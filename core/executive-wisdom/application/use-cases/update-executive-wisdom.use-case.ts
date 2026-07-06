import { ExecutiveWisdomNotFoundError } from "../../shared";
import { createWisdomUpdatedEvent } from "../../domain";
import type { UpdateExecutiveWisdomDto } from "../dto";
import type { ExecutiveWisdomEngineDependencies } from "../dependencies";

export class UpdateExecutiveWisdomUseCase {
  constructor(private readonly deps: ExecutiveWisdomEngineDependencies) {}

  async execute(dto: UpdateExecutiveWisdomDto) {
    const existing = await this.deps.repository.findWisdomById(dto.wisdomId);
    if (!existing) {
      throw new ExecutiveWisdomNotFoundError(dto.wisdomId);
    }

    const changedFields = Object.entries(dto)
      .filter(([key, value]) => key !== "wisdomId" && value !== undefined)
      .map(([key]) => key);

    const updated = existing.update({
      confidence: dto.confidence,
      importance: dto.importance,
      businessImpact: dto.businessImpact,
      risk: dto.risk,
      recommendation: dto.recommendation,
      reasoning: dto.reasoning,
      expectedOutcome: dto.expectedOutcome,
      successRate: dto.successRate,
      roi: dto.roi,
      tags: dto.tags,
    });

    await this.deps.repository.saveWisdom(updated);

    const event = createWisdomUpdatedEvent(updated, changedFields);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncWisdom({
      companyId: updated.companyId,
      wisdom: updated.toJSON(),
      syncReason: "updated",
    });
    await this.deps.companyBrain.notifyWisdomChange(updated);

    return updated;
  }
}
