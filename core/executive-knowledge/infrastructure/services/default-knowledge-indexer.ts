import type { KnowledgeIndexer, KnowledgeIndexEntry } from "../../domain";
import type { KnowledgeRecord } from "../../domain";

function tokenize(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

export class DefaultKnowledgeIndexer implements KnowledgeIndexer {
  private readonly entries = new Map<string, KnowledgeIndexEntry>();

  async index(record: KnowledgeRecord): Promise<KnowledgeIndexEntry> {
    const tokens = [
      ...new Set(
        tokenize(
          [record.title, record.summary, record.content, ...record.tags].join(" "),
        ),
      ),
    ];

    const entry: KnowledgeIndexEntry = {
      recordId: record.id,
      companyId: record.companyId,
      tokens,
      domain: record.domain,
      categoryKind: record.category.kind,
      tags: [...record.tags],
      indexedAt: new Date().toISOString(),
    };

    this.entries.set(record.id, entry);
    return entry;
  }

  async remove(recordId: string): Promise<void> {
    this.entries.delete(recordId);
  }

  async findByToken(companyId: string, token: string): Promise<string[]> {
    const normalized = token.toLowerCase();
    const matches: string[] = [];

    for (const entry of this.entries.values()) {
      if (entry.companyId === companyId && entry.tokens.includes(normalized)) {
        matches.push(entry.recordId);
      }
    }

    return matches;
  }
}
