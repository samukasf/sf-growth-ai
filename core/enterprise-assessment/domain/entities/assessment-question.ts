import type {
  AssessmentCategoryId,
  AssessmentDimensionKey,
  AssessmentId,
  AssessmentQuestionId,
} from "../../shared";

export type AssessmentQuestionProps = {
  id: AssessmentQuestionId;
  assessmentId: AssessmentId;
  categoryId: AssessmentCategoryId;
  dimensionKey: AssessmentDimensionKey;
  text: string;
  weight: number;
  required: boolean;
  order: number;
};

export class AssessmentQuestion {
  readonly id: AssessmentQuestionId;
  readonly assessmentId: AssessmentId;
  readonly categoryId: AssessmentCategoryId;
  readonly dimensionKey: AssessmentDimensionKey;
  readonly text: string;
  readonly weight: number;
  readonly required: boolean;
  readonly order: number;

  private constructor(props: AssessmentQuestionProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.categoryId = props.categoryId;
    this.dimensionKey = props.dimensionKey;
    this.text = props.text;
    this.weight = props.weight;
    this.required = props.required;
    this.order = props.order;
  }

  static create(
    props: Omit<AssessmentQuestionProps, "id"> & { id?: AssessmentQuestionId },
  ): AssessmentQuestion {
    if (!props.text.trim()) throw new Error("text is required");
    return new AssessmentQuestion({
      id: props.id ?? `aqst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...props,
    });
  }

  toJSON(): AssessmentQuestionProps {
    return { ...this };
  }
}
