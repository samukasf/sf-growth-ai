import type { KnowledgeRecord, KnowledgeRelation, KnowledgeRelationType } from "../entities";

export type ResolveRelationsInput = {
  source: KnowledgeRecord;
  candidates: KnowledgeRecord[];
  relationType?: KnowledgeRelationType;
};

export type ResolvedRelation = {
  relation: KnowledgeRelation;
  reason: string;
};

export interface KnowledgeRelationshipResolver {
  resolve(input: ResolveRelationsInput): ResolvedRelation[];
  findRelated(
    record: KnowledgeRecord,
    allRecords: KnowledgeRecord[],
  ): KnowledgeRecord[];
}
