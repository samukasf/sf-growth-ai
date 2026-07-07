import { createMemoryArchivedEvent } from "../../domain";
import type { ArchiveMemoryDto } from "../dto";
import type { EnterpriseMemoryRuntimeDependencies } from "../dependencies";

export class ArchiveMemoryUseCase {
  constructor(private readonly deps: EnterpriseMemoryRuntimeDependencies) {}

  async execute(dto: ArchiveMemoryDto) {
    const archived = await this.deps.lifecycleManager.archive(dto.memoryId);
    await this.deps.indexer.removeFromIndex(archived.id);
    await this.deps.eventDispatcher.publish(createMemoryArchivedEvent(archived));

    if (this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.notifyMemoryArchived?.({
        organizationId: archived.organizationId,
        memoryId: archived.id,
      });
    }

    return archived;
  }
}
