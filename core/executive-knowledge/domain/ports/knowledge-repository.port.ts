import type { CompanyId, KnowledgeRecordId } from "../../shared";
import type { KnowledgeRecord, KnowledgeRelation } from "../entities";

export type KnowledgeQuery = {
  companyId: CompanyId;
  domain?: string;
  categoryKind?: string;
  tags?: string[];
  minConfidence?: number;
  includeArchived?: boolean;
  limit?: number;
};

export interface KnowledgeRepository {
  save(record: KnowledgeRecord): Promise<void>;
  findById(id: KnowledgeRecordId): Promise<KnowledgeRecord | null>;
  findByCompany(companyId: CompanyId): Promise<KnowledgeRecord[]>;
  query(filters: KnowledgeQuery): Promise<KnowledgeRecord[]>;
  delete(id: KnowledgeRecordId): Promise<void>;
  saveRelation(relation: KnowledgeRelation): Promise<void>;
  findRelations(recordId: KnowledgeRecordId): Promise<KnowledgeRelation[]>;
}
