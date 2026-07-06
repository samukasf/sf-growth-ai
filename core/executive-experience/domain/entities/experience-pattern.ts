import type { CompanyId, ExperienceId, ExperiencePatternId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type ExperiencePatternType =
  | "success"
  | "failure"
  | "recurring_problem"
  | "reusable_solution"
  | "similar_project"
  | "best_practice";

export type ExperiencePatternProps = {
  id: ExperiencePatternId;
  companyId: CompanyId;
  type: ExperiencePatternType;
  title: string;
  description: string;
  relatedExperienceIds: ExperienceId[];
  frequency: number;
  confidence: Score;
  detectedAt: string;
};

export class ExperiencePattern {
  readonly id: ExperiencePatternId;
  readonly companyId: CompanyId;
  readonly type: ExperiencePatternType;
  readonly title: string;
  readonly description: string;
  readonly relatedExperienceIds: ExperienceId[];
  readonly frequency: number;
  readonly confidence: Score;
  readonly detectedAt: string;

  private constructor(props: ExperiencePatternProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.relatedExperienceIds = [...props.relatedExperienceIds];
    this.frequency = props.frequency;
    this.confidence = props.confidence;
    this.detectedAt = props.detectedAt;
  }

  static create(
    props: Omit<ExperiencePatternProps, "id" | "detectedAt"> & {
      id?: ExperiencePatternId;
      detectedAt?: string;
    },
  ): ExperiencePattern {
    return new ExperiencePattern({
      id: props.id ?? `pattern-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      type: props.type,
      title: props.title.trim(),
      description: props.description.trim(),
      relatedExperienceIds: props.relatedExperienceIds,
      frequency: Math.max(1, props.frequency),
      confidence: clampScore(props.confidence),
      detectedAt: props.detectedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExperiencePatternProps {
    return {
      id: this.id,
      companyId: this.companyId,
      type: this.type,
      title: this.title,
      description: this.description,
      relatedExperienceIds: [...this.relatedExperienceIds],
      frequency: this.frequency,
      confidence: this.confidence,
      detectedAt: this.detectedAt,
    };
  }
}
