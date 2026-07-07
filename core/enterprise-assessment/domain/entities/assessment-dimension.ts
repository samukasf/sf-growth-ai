import type {
  AssessmentDimensionId,
  AssessmentDimensionKey,
  AssessmentId,
} from "../../shared";

export type AssessmentDimensionProps = {
  id: AssessmentDimensionId;
  assessmentId: AssessmentId;
  key: AssessmentDimensionKey;
  label: string;
  score: number;
  weight: number;
  maturityLevel: "initial" | "developing" | "defined" | "managed" | "optimized";
  gapCount: number;
  calculatedAt: string;
};

export class AssessmentDimension {
  readonly id: AssessmentDimensionId;
  readonly assessmentId: AssessmentId;
  readonly key: AssessmentDimensionKey;
  readonly label: string;
  readonly score: number;
  readonly weight: number;
  readonly maturityLevel: AssessmentDimensionProps["maturityLevel"];
  readonly gapCount: number;
  readonly calculatedAt: string;

  private constructor(props: AssessmentDimensionProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.key = props.key;
    this.label = props.label;
    this.score = props.score;
    this.weight = props.weight;
    this.maturityLevel = props.maturityLevel;
    this.gapCount = props.gapCount;
    this.calculatedAt = props.calculatedAt;
  }

  static create(
    props: Omit<AssessmentDimensionProps, "id" | "calculatedAt" | "maturityLevel"> & {
      id?: AssessmentDimensionId;
      calculatedAt?: string;
      maturityLevel?: AssessmentDimensionProps["maturityLevel"];
    },
  ): AssessmentDimension {
    return new AssessmentDimension({
      id: props.id ?? `adim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: props.assessmentId,
      key: props.key,
      label: props.label,
      score: props.score,
      weight: props.weight,
      maturityLevel: props.maturityLevel ?? resolveMaturityLevel(props.score),
      gapCount: props.gapCount,
      calculatedAt: props.calculatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AssessmentDimensionProps {
    return { ...this };
  }
}

export function resolveMaturityLevel(
  score: number,
): AssessmentDimensionProps["maturityLevel"] {
  if (score < 20) return "initial";
  if (score < 40) return "developing";
  if (score < 60) return "defined";
  if (score < 80) return "managed";
  return "optimized";
}
