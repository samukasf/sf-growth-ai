import { EnterpriseMemory, MemorySource } from "../../domain";
import type { MemoryRepository } from "../../domain/ports/memory-repository.port";
import type { MemoryWriter, WriteMemoryInput } from "../../domain/ports/memory-writer.port";

export class DefaultMemoryWriter implements MemoryWriter {
  constructor(private readonly repository: MemoryRepository) {}

  async write(input: WriteMemoryInput) {
    const memory = EnterpriseMemory.create({
      organizationId: input.organizationId,
      companyId: input.companyId,
      type: input.type,
      title: input.title,
      summary: input.summary,
      content: input.content,
      source: MemorySource.create({
        type: input.sourceType,
        origin: input.sourceOrigin,
        referenceId: input.sourceReferenceId,
        capturedAt: new Date().toISOString(),
      }),
      importance: input.importance ?? 50,
      confidence: input.confidence ?? 50,
      tags: input.tags ?? [],
      relationships: [],
      visibility: input.visibility ?? "organization",
      owner: input.owner,
    });

    await this.repository.save(memory);
    return memory;
  }
}
