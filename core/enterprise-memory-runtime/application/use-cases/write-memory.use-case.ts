import {
  createMemoryCreatedEvent,
  createMemoryIndexedEvent,
} from "../../domain";
import type { WriteMemoryDto } from "../dto";
import type { EnterpriseMemoryRuntimeDependencies } from "../dependencies";

export class WriteMemoryUseCase {
  constructor(private readonly deps: EnterpriseMemoryRuntimeDependencies) {}

  async execute(dto: WriteMemoryDto) {
    let importance = dto.importance ?? 50;

    if (this.deps.executiveCeo.isAvailable() && this.deps.executiveCeo.prioritizeMemory) {
      importance = await this.deps.executiveCeo.prioritizeMemory({
        organizationId: dto.organizationId,
        memoryId: "pending",
        importance,
      });
    }

    const memory = await this.deps.writer.write({
      organizationId: dto.organizationId,
      companyId: dto.companyId,
      type: dto.type,
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      sourceType: dto.sourceType,
      sourceOrigin: dto.sourceOrigin,
      sourceReferenceId: dto.sourceReferenceId,
      importance,
      confidence: dto.confidence ?? 50,
      tags: dto.tags,
      visibility: dto.visibility ?? "organization",
      owner: dto.owner,
    });

    const relevance = this.deps.retentionEngine.scoreRelevance(memory);
    const enriched = memory.update({ relevanceScore: relevance.value });
    await this.deps.repository.save(enriched);

    const indexEntry = await this.deps.indexer.index(enriched);
    await this.deps.eventDispatcher.publish(createMemoryCreatedEvent(enriched));
    await this.deps.eventDispatcher.publish(
      createMemoryIndexedEvent(indexEntry, dto.organizationId, dto.companyId),
    );

    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.syncMemory?.({
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        memoryId: enriched.id,
      });
    }

    if (this.deps.organizationBrain.isAvailable()) {
      await this.deps.organizationBrain.notifyMemoryIndexed?.({
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        memoryId: enriched.id,
      });
    }

    if (this.deps.executiveOrchestrator.isAvailable()) {
      await this.deps.executiveOrchestrator.notifyMemoryChange?.({
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        memoryId: enriched.id,
        action: "created",
      });
    }

    return enriched;
  }
}
