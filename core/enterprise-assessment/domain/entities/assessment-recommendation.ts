import type {
  AssessmentId,
  AssessmentRecommendationId,
  AssessmentDimensionKey,
  RecommendationPriority,
} from "../../shared";

export type AssessmentRecommendationProps = {
  id: AssessmentRecommendationId;
  assessmentId: AssessmentId;
  dimensionKey: AssessmentDimensionKey;
  title: string;
  description: string;
  priority: RecommendationPriority;
  estimatedImpact: string;
  estimatedRoi?: string;
  effort: "low" | "medium" | "high";
  horizon: "30_days" | "90_days" | "180_days" | "365_days";
  createdAt: string;
};

export class AssessmentRecommendation {
  readonly id: AssessmentRecommendationId;
  readonly assessmentId: AssessmentId;
  readonly dimensionKey: AssessmentDimensionKey;
  readonly title: string;
  readonly description: string;
  readonly priority: RecommendationPriority;
  readonly estimatedImpact: string;
  readonly estimatedRoi?: string;
  readonly effort: AssessmentRecommendationProps["effort"];
  readonly horizon: AssessmentRecommendationProps["horizon"];
  readonly createdAt: string;

  private constructor(props: AssessmentRecommendationProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.dimensionKey = props.dimensionKey;
    this.title = props.title;
    this.description = props.description;
    this.priority = props.priority;
    this.estimatedImpact = props.estimatedImpact;
    this.estimatedRoi = props.estimatedRoi;
    this.effort = props.effort;
    this.horizon = props.horizon;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AssessmentRecommendationProps, "id" | "createdAt"> & {
      id?: AssessmentRecommendationId;
      createdAt?: string;
    },
  ): AssessmentRecommendation {
    if (!props.title.trim()) throw new Error("title is required");
    return new AssessmentRecommendation({
      id: props.id ?? `arec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: props.createdAt ?? new Date().toISOString(),
      ...props,
    });
  }

  toJSON(): AssessmentRecommendationProps {
    return { ...this };
  }
}
