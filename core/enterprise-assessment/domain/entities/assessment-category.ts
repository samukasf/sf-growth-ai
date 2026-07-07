import type { AssessmentCategoryId, AssessmentDimensionKey, AssessmentId } from "../../shared";

export type AssessmentCategoryProps = {
  id: AssessmentCategoryId;
  assessmentId: AssessmentId;
  dimensionKey: AssessmentDimensionKey;
  label: string;
  description: string;
  weight: number;
  questionCount: number;
  answeredCount: number;
  score: number;
};

export class AssessmentCategory {
  readonly id: AssessmentCategoryId;
  readonly assessmentId: AssessmentId;
  readonly dimensionKey: AssessmentDimensionKey;
  readonly label: string;
  readonly description: string;
  readonly weight: number;
  readonly questionCount: number;
  readonly answeredCount: number;
  readonly score: number;

  private constructor(props: AssessmentCategoryProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.dimensionKey = props.dimensionKey;
    this.label = props.label;
    this.description = props.description;
    this.weight = props.weight;
    this.questionCount = props.questionCount;
    this.answeredCount = props.answeredCount;
    this.score = props.score;
  }

  static create(
    props: Omit<AssessmentCategoryProps, "id" | "answeredCount" | "score"> & {
      id?: AssessmentCategoryId;
      answeredCount?: number;
      score?: number;
    },
  ): AssessmentCategory {
    return new AssessmentCategory({
      id: props.id ?? `acat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: props.assessmentId,
      dimensionKey: props.dimensionKey,
      label: props.label,
      description: props.description,
      weight: props.weight,
      questionCount: props.questionCount,
      answeredCount: props.answeredCount ?? 0,
      score: props.score ?? 0,
    });
  }

  withProgress(answeredCount: number, score: number): AssessmentCategory {
    return AssessmentCategory.create({ ...this.toJSON(), answeredCount, score });
  }

  toJSON(): AssessmentCategoryProps {
    return { ...this };
  }
}
