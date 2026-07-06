import { KnowledgeRecordNotFoundError } from "../../shared";
import { createKnowledgeArchivedEvent } from "../../domain";
import type { ExecutiveKnowledgeEngineDependencies } from "../dependencies";

export class ArchiveKnowledgeUseCase {
  constructor(private readonly deps: ExecutiveKnowledgeEngineDependencies) {}

  async execute(recordId: string) {
    const existing = await this.deps.repository.findById(recordId);
    if (!existing) {
      throw new KnowledgeRecordNotFoundError(recordId);
    }

    const archived = existing.markArchived();

    await this.deps.repository.save(archived);
    await this.deps.indexer.remove(archived.id);

    const event = createKnowledgeArchivedEvent(archived);
    await this.deps.eventDispatcher.publish(event);

    await this.deps.executiveMemory.syncKnowledge({
      companyId: archived.companyId,
      record: archived.toJSON(),
      syncReason: "archived",
    });
    await this.deps.companyBrain.notifyKnowledgeChange(archived);
    await this.deps.executiveLearning.onKnowledgeDomainEvent(event);

    return archived;
  }
}
