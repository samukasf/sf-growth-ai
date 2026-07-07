import { MemoryIndexEntry } from "../../domain";
import type { EnterpriseMemory } from "../../domain/entities/enterprise-memory";
import type { MemoryRepository } from "../../domain/ports/memory-repository.port";
import type { MemoryIndexer } from "../../domain/ports/memory-indexer.port";

function extractKeywords(memory: EnterpriseMemory): string[] {
  const text = `${memory.title} ${memory.summary} ${memory.content}`.toLowerCase();
  const words = text.split(/\W+/).filter((word) => word.length > 3);
  return [...new Set(words)].slice(0, 20);
}

export class DefaultMemoryIndexer implements MemoryIndexer {
  constructor(private readonly repository: MemoryRepository) {}

  async index(memory: EnterpriseMemory) {
    const entry = MemoryIndexEntry.create({
      memoryId: memory.id,
      type: memory.type,
      title: memory.title,
      summary: memory.summary,
      tags: memory.tags,
      keywords: extractKeywords(memory),
      relevanceScore: memory.relevanceScore,
    });

    await this.repository.saveIndexEntry(entry);
    return entry;
  }

  async reindex(memory: EnterpriseMemory) {
    return this.index(memory);
  }

  async removeFromIndex(memoryId: string) {
    const entry = await this.repository.findIndexEntryByMemoryId(memoryId);
    if (entry) {
      await this.repository.saveIndexEntry(
        MemoryIndexEntry.create({
          ...entry.toJSON(),
          relevanceScore: 0,
          keywords: [],
        }),
      );
    }
  }

  async prepareSemanticVector(memoryId: string) {
    const entry = await this.repository.findIndexEntryByMemoryId(memoryId);
    if (!entry) return false;

    await this.repository.saveIndexEntry(
      MemoryIndexEntry.create({
        ...entry.toJSON(),
        semanticVectorReady: true,
      }),
    );

    return true;
  }
}
