import {
  KnowledgeCategory,
  KnowledgeMetadata,
  KnowledgeRecord,
  KnowledgeRelation,
  KnowledgeSource,
  type KnowledgeQuery,
  type KnowledgeRepository,
} from "../../domain";

function serializeRecord(record: KnowledgeRecord): string {
  const json = record.toJSON();
  return JSON.stringify({
    ...json,
    source: record.source.toJSON(),
    category: record.category.toJSON(),
    metadata: record.metadata.toJSON(),
  });
}

function deserializeRecord(raw: string): KnowledgeRecord {
  const parsed = JSON.parse(raw) as ReturnType<KnowledgeRecord["toJSON"]> & {
    source: ReturnType<KnowledgeSource["toJSON"]>;
    category: ReturnType<KnowledgeCategory["toJSON"]>;
    metadata: ReturnType<KnowledgeMetadata["toJSON"]>;
  };

  return KnowledgeRecord.create({
    ...parsed,
    source: KnowledgeSource.create(parsed.source),
    category: KnowledgeCategory.create(parsed.category),
    metadata: KnowledgeMetadata.create(parsed.metadata),
  });
}

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private readonly records = new Map<string, string>();
  private readonly relations = new Map<string, KnowledgeRelation[]>();

  async save(record: KnowledgeRecord): Promise<void> {
    this.records.set(record.id, serializeRecord(record));
  }

  async findById(id: string): Promise<KnowledgeRecord | null> {
    const raw = this.records.get(id);
    return raw ? deserializeRecord(raw) : null;
  }

  async findByCompany(companyId: string): Promise<KnowledgeRecord[]> {
    const results: KnowledgeRecord[] = [];

    for (const raw of this.records.values()) {
      const record = deserializeRecord(raw);
      if (record.companyId === companyId) {
        results.push(record);
      }
    }

    return results.sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  async query(filters: KnowledgeQuery): Promise<KnowledgeRecord[]> {
    let results = await this.findByCompany(filters.companyId);

    if (!filters.includeArchived) {
      results = results.filter((record) => record.isActive());
    }

    if (filters.domain) {
      results = results.filter((record) => record.domain === filters.domain);
    }

    if (filters.categoryKind) {
      results = results.filter((record) => record.category.kind === filters.categoryKind);
    }

    if (filters.tags?.length) {
      results = results.filter((record) =>
        filters.tags!.some((tag) => record.tags.includes(tag)),
      );
    }

    if (filters.minConfidence !== undefined) {
      results = results.filter((record) => record.confidence >= filters.minConfidence!);
    }

    if (filters.limit !== undefined) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
    this.relations.delete(id);
  }

  async saveRelation(relation: KnowledgeRelation): Promise<void> {
    const sourceRelations = this.relations.get(relation.sourceRecordId) ?? [];
    sourceRelations.push(relation);
    this.relations.set(relation.sourceRecordId, sourceRelations);

    const targetRelations = this.relations.get(relation.targetRecordId) ?? [];
    targetRelations.push(relation);
    this.relations.set(relation.targetRecordId, targetRelations);
  }

  async findRelations(recordId: string): Promise<KnowledgeRelation[]> {
    return this.relations.get(recordId) ?? [];
  }
}
