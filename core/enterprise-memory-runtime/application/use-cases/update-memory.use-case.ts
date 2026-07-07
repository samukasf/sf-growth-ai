import {
  createMemoryUpdatedEvent,
  createMemoryVersionedEvent,
} from "../../domain";
import type { UpdateMemoryDto } from "../dto";
import type { EnterpriseMemoryRuntimeDependencies } from "../dependencies";

export class UpdateMemoryUseCase {
  constructor(private readonly deps: EnterpriseMemoryRuntimeDependencies) {}

  async execute(dto: UpdateMemoryDto) {
    const { memory, version } = await this.deps.lifecycleManager.update({
      memoryId: dto.memoryId,
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      importance: dto.importance,
      confidence: dto.confidence,
      tags: dto.tags,
      visibility: dto.visibility,
      owner: dto.owner,
      changeReason: dto.changeReason ?? "update",
      updatedBy: dto.updatedBy,
    });

    await this.deps.indexer.reindex(memory);
    await this.deps.eventDispatcher.publish(createMemoryUpdatedEvent(memory));
    await this.deps.eventDispatcher.publish(
      createMemoryVersionedEvent(
        version,
        memory.organizationId,
        memory.companyId,
      ),
    );

    return { memory, version };
  }
}
