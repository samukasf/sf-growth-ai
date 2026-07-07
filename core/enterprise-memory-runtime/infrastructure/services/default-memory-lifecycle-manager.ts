import { EnterpriseMemory, MemoryVersion } from "../../domain";
import { MemoryNotFoundError } from "../../shared";
import type { MemoryRepository } from "../../domain/ports/memory-repository.port";
import type {
  MemoryLifecycleManager,
  UpdateMemoryInput,
} from "../../domain/ports/memory-lifecycle-manager.port";

export class DefaultMemoryLifecycleManager implements MemoryLifecycleManager {
  constructor(private readonly repository: MemoryRepository) {}

  async update(input: UpdateMemoryInput) {
    const existing = await this.repository.findById(input.memoryId);
    if (!existing) throw new MemoryNotFoundError(input.memoryId);

    const version = await this.createVersion(
      existing,
      input.changeReason ?? "update",
      input.updatedBy,
    );

    const updated = existing.update({
      title: input.title,
      summary: input.summary,
      content: input.content,
      importance: input.importance,
      confidence: input.confidence,
      tags: input.tags,
      visibility: input.visibility,
      owner: input.owner,
      version: existing.currentVersion + 1,
    });

    await this.repository.save(updated);
    return { memory: updated, version };
  }

  async archive(memoryId: string) {
    const existing = await this.repository.findById(memoryId);
    if (!existing) throw new MemoryNotFoundError(memoryId);

    const archived = existing.archive();
    await this.repository.save(archived);
    return archived;
  }

  async restore(memoryId: string) {
    const existing = await this.repository.findById(memoryId);
    if (!existing) throw new MemoryNotFoundError(memoryId);

    const restored = EnterpriseMemory.create({
      ...existing.toJSON(),
      status: "active",
      updatedAt: new Date().toISOString(),
    });

    await this.repository.save(restored);
    return restored;
  }

  async createVersion(memory: EnterpriseMemory, changeReason: string, updatedBy: string) {
    const versions = await this.repository.findVersionsByMemoryId(memory.id);
    const versionNumber = versions.length + 1;

    const version = MemoryVersion.create({
      memoryId: memory.id,
      organizationId: memory.organizationId,
      companyId: memory.companyId,
      versionNumber,
      title: memory.title,
      summary: memory.summary,
      content: memory.content,
      createdBy: updatedBy,
      changeReason,
    });

    await this.repository.saveVersion(version);
    return version;
  }
}
