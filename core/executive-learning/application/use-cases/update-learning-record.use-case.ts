import { LearningRecordNotFoundError } from "../../shared";
import { createLearningUpdatedEvent } from "../../domain";
import type { UpdateLearningRecordDto } from "../dto";
import type { ExecutiveLearningEngineDependencies } from "../dependencies";

export class UpdateLearningRecordUseCase {
  constructor(private readonly deps: ExecutiveLearningEngineDependencies) {}

  async execute(dto: UpdateLearningRecordDto) {
    const existing = await this.deps.repository.findRecordById(dto.recordId);
    if (!existing) {
      throw new LearningRecordNotFoundError(dto.recordId);
    }

    const changedFields = Object.entries(dto)
      .filter(([key, value]) => key !== "recordId" && value !== undefined)
      .map(([key]) => key);

    const updated = existing.update({
      successLevel: dto.successLevel,
      confidence: dto.confidence,
      impact: dto.impact,
      roi: dto.roi,
      feedback: dto.feedback,
      lessonsLearned: dto.lessonsLearned,
      recommendations: dto.recommendations,
    });

    await this.deps.repository.saveRecord(updated);

    const event = createLearningUpdatedEvent(updated, changedFields);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncLearning({
      companyId: updated.companyId,
      record: updated.toJSON(),
      syncReason: "updated",
    });
    await this.deps.companyBrain.notifyLearningChange(updated);

    return updated;
  }
}
