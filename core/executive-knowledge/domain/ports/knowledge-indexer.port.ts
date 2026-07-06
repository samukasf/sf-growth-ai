import type { KnowledgeRecord } from "../entities";

export type KnowledgeIndexEntry = {
  recordId: string;
  companyId: string;
  tokens: string[];
  domain: string;
  categoryKind: string;
  tags: string[];
  indexedAt: string;
};

export interface KnowledgeIndexer {
  index(record: KnowledgeRecord): Promise<KnowledgeIndexEntry>;
  remove(recordId: string): Promise<void>;
  findByToken(companyId: string, token: string): Promise<string[]>;
}
