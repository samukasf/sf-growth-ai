import {
  EnterpriseMemory,
  MemoryIndexEntry,
  MemoryRelationship,
  MemorySource,
  MemoryVersion,
  type MemoryQuery,
  type MemoryRepository,
} from "../../domain";

function serializeMemory(memory: EnterpriseMemory): string {
  const json = memory.toJSON();
  return JSON.stringify({
    ...json,
    source: memory.source.toJSON(),
    relationships: memory.relationships.map((rel) => rel.toJSON()),
  });
}

function deserializeMemory(raw: string): EnterpriseMemory {
  const parsed = JSON.parse(raw) as ReturnType<EnterpriseMemory["toJSON"]> & {
    source: ReturnType<MemorySource["toJSON"]>;
    relationships: ReturnType<MemoryRelationship["toJSON"]>[];
  };

  return EnterpriseMemory.create({
    ...parsed,
    source: MemorySource.create(parsed.source),
    relationships: parsed.relationships.map((rel) => MemoryRelationship.create(rel)),
  });
}

export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly memories = new Map<string, string>();
  private readonly versions = new Map<string, MemoryVersion[]>();
  private readonly relationships = new Map<string, MemoryRelationship[]>();
  private readonly indexEntries = new Map<string, MemoryIndexEntry>();

  async save(memory: EnterpriseMemory): Promise<void> {
    this.memories.set(memory.id, serializeMemory(memory));
  }

  async findById(id: string): Promise<EnterpriseMemory | null> {
    const raw = this.memories.get(id);
    return raw ? deserializeMemory(raw) : null;
  }

  async findByOrganization(organizationId: string, companyId: string): Promise<EnterpriseMemory[]> {
    const results: EnterpriseMemory[] = [];
    for (const raw of this.memories.values()) {
      const memory = deserializeMemory(raw);
      if (memory.organizationId === organizationId && memory.companyId === companyId) {
        results.push(memory);
      }
    }
    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async query(filters: MemoryQuery): Promise<EnterpriseMemory[]> {
    let results = await this.findByOrganization(filters.organizationId, filters.companyId);

    if (!filters.includeArchived) {
      results = results.filter((memory) => memory.isActive());
    }

    if (filters.type) {
      results = results.filter((memory) => memory.type === filters.type);
    }

    if (filters.owner) {
      results = results.filter((memory) => memory.owner === filters.owner);
    }

    if (filters.tags?.length) {
      results = results.filter((memory) =>
        filters.tags!.every((tag) => memory.tags.includes(tag)),
      );
    }

    if (filters.query) {
      const term = filters.query.toLowerCase();
      results = results.filter(
        (memory) =>
          memory.title.toLowerCase().includes(term) ||
          memory.summary.toLowerCase().includes(term) ||
          memory.content.toLowerCase().includes(term),
      );
    }

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async saveVersion(version: MemoryVersion): Promise<void> {
    const existing = this.versions.get(version.memoryId) ?? [];
    existing.push(version);
    this.versions.set(version.memoryId, existing);
  }

  async findVersionsByMemoryId(memoryId: string): Promise<MemoryVersion[]> {
    return [...(this.versions.get(memoryId) ?? [])].sort(
      (a, b) => b.versionNumber - a.versionNumber,
    );
  }

  async saveRelationship(relationship: MemoryRelationship): Promise<void> {
    const existing = this.relationships.get(relationship.sourceMemoryId) ?? [];
    existing.push(relationship);
    this.relationships.set(relationship.sourceMemoryId, existing);
  }

  async findRelationshipsByMemoryId(memoryId: string): Promise<MemoryRelationship[]> {
    return [...(this.relationships.get(memoryId) ?? [])];
  }

  async saveIndexEntry(entry: MemoryIndexEntry): Promise<void> {
    this.indexEntries.set(entry.memoryId, entry);
  }

  async findIndexEntryByMemoryId(memoryId: string): Promise<MemoryIndexEntry | null> {
    return this.indexEntries.get(memoryId) ?? null;
  }
}
