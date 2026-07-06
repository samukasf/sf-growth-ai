import type { KnowledgeRecordId, KnowledgeRelationId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type KnowledgeRelationType =
  | "supports"
  | "contradicts"
  | "derives_from"
  | "related_to"
  | "supersedes";

export type KnowledgeRelationProps = {
  id: KnowledgeRelationId;
  sourceRecordId: KnowledgeRecordId;
  targetRecordId: KnowledgeRecordId;
  relationType: KnowledgeRelationType;
  strength: Score;
  createdAt: string;
};

export class KnowledgeRelation {
  readonly id: KnowledgeRelationId;
  readonly sourceRecordId: KnowledgeRecordId;
  readonly targetRecordId: KnowledgeRecordId;
  readonly relationType: KnowledgeRelationType;
  readonly strength: Score;
  readonly createdAt: string;

  private constructor(props: KnowledgeRelationProps) {
    this.id = props.id;
    this.sourceRecordId = props.sourceRecordId;
    this.targetRecordId = props.targetRecordId;
    this.relationType = props.relationType;
    this.strength = props.strength;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<KnowledgeRelationProps, "id" | "createdAt"> & {
      id?: KnowledgeRelationId;
      createdAt?: string;
    },
  ): KnowledgeRelation {
    if (props.sourceRecordId === props.targetRecordId) {
      throw new Error("Knowledge relation cannot reference the same record");
    }

    return new KnowledgeRelation({
      id: props.id ?? `relation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sourceRecordId: props.sourceRecordId,
      targetRecordId: props.targetRecordId,
      relationType: props.relationType,
      strength: clampScore(props.strength),
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  involves(recordId: KnowledgeRecordId): boolean {
    return this.sourceRecordId === recordId || this.targetRecordId === recordId;
  }

  toJSON(): KnowledgeRelationProps {
    return {
      id: this.id,
      sourceRecordId: this.sourceRecordId,
      targetRecordId: this.targetRecordId,
      relationType: this.relationType,
      strength: this.strength,
      createdAt: this.createdAt,
    };
  }
}
