import type { CompanyId, LearningPatternId, LearningRecordId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type LearningPatternType =
  | "recurring_success"
  | "recurring_failure"
  | "seasonal"
  | "behavioral"
  | "operational"
  | "strategic";

export type LearningPatternProps = {
  id: LearningPatternId;
  companyId: CompanyId;
  type: LearningPatternType;
  title: string;
  description: string;
  relatedRecordIds: LearningRecordId[];
  frequency: number;
  confidence: Score;
  detectedAt: string;
};

export class LearningPattern {
  readonly id: LearningPatternId;
  readonly companyId: CompanyId;
  readonly type: LearningPatternType;
  readonly title: string;
  readonly description: string;
  readonly relatedRecordIds: LearningRecordId[];
  readonly frequency: number;
  readonly confidence: Score;
  readonly detectedAt: string;

  private constructor(props: LearningPatternProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.relatedRecordIds = [...props.relatedRecordIds];
    this.frequency = props.frequency;
    this.confidence = props.confidence;
    this.detectedAt = props.detectedAt;
  }

  static create(
    props: Omit<LearningPatternProps, "id" | "detectedAt"> & {
      id?: LearningPatternId;
      detectedAt?: string;
    },
  ): LearningPattern {
    if (!props.title.trim()) {
      throw new Error("Learning pattern title is required");
    }

    return new LearningPattern({
      id: props.id ?? `pattern-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      type: props.type,
      title: props.title.trim(),
      description: props.description.trim(),
      relatedRecordIds: props.relatedRecordIds,
      frequency: Math.max(1, props.frequency),
      confidence: clampScore(props.confidence),
      detectedAt: props.detectedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): LearningPatternProps {
    return {
      id: this.id,
      companyId: this.companyId,
      type: this.type,
      title: this.title,
      description: this.description,
      relatedRecordIds: [...this.relatedRecordIds],
      frequency: this.frequency,
      confidence: this.confidence,
      detectedAt: this.detectedAt,
    };
  }
}
