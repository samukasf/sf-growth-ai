import { KnowledgeRecordNotFoundError } from "../../shared";
import { createKnowledgeUpdatedEvent } from "../../domain";
import type { UpdateKnowledgeRecordDto } from "../dto";
import type { ExecutiveKnowledgeEngineDependencies } from "../dependencies";

export class UpdateKnowledgeRecordUseCase {
  constructor(private readonly deps: ExecutiveKnowledgeEngineDependencies) {}

  async execute(dto: UpdateKnowledgeRecordDto) {
    const existing = await this.deps.repository.findById(dto.recordId);
    if (!existing) {
      throw new KnowledgeRecordNotFoundError(dto.recordId);
    }

    const changedFields = Object.entries(dto)
      .filter(([key, value]) => key !== "recordId" && value !== undefined)
      .map(([key]) => key);

    const updated = existing.updateContent({
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      confidence: dto.confidence,
      importance: dto.importance,
      relevance: dto.relevance,
      tags: dto.tags,
      references: dto.references,
    });

    await this.deps.repository.save(updated);
    await this.deps.indexer.index(updated);

    const event = createKnowledgeUpdatedEvent(updated, changedFields);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncKnowledge({
      companyId: updated.companyId,
      record: updated.toJSON(),
      syncReason: "updated",
    });
    await this.deps.companyBrain.notifyKnowledgeChange(updated);
    await this.deps.executiveLearning.onKnowledgeDomainEvent(event);

    return updated;
  }
}
