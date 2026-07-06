import type { CompanyId, KnowledgeInsightId, KnowledgeRecordId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type KnowledgeInsightProps = {
  id: KnowledgeInsightId;
  recordId: KnowledgeRecordId;
  companyId: CompanyId;
  title: string;
  description: string;
  confidence: Score;
  derivedFrom: KnowledgeRecordId[];
  createdAt: string;
};

export class KnowledgeInsight {
  readonly id: KnowledgeInsightId;
  readonly recordId: KnowledgeRecordId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly description: string;
  readonly confidence: Score;
  readonly derivedFrom: KnowledgeRecordId[];
  readonly createdAt: string;

  private constructor(props: KnowledgeInsightProps) {
    this.id = props.id;
    this.recordId = props.recordId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.description = props.description;
    this.confidence = props.confidence;
    this.derivedFrom = [...props.derivedFrom];
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<KnowledgeInsightProps, "id" | "createdAt"> & {
      id?: KnowledgeInsightId;
      createdAt?: string;
    },
  ): KnowledgeInsight {
    if (!props.title.trim()) {
      throw new Error("Knowledge insight title is required");
    }

    return new KnowledgeInsight({
      id: props.id ?? `insight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      recordId: props.recordId,
      companyId: props.companyId,
      title: props.title.trim(),
      description: props.description.trim(),
      confidence: clampScore(props.confidence),
      derivedFrom: props.derivedFrom,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): KnowledgeInsightProps {
    return {
      id: this.id,
      recordId: this.recordId,
      companyId: this.companyId,
      title: this.title,
      description: this.description,
      confidence: this.confidence,
      derivedFrom: [...this.derivedFrom],
      createdAt: this.createdAt,
    };
  }
}
