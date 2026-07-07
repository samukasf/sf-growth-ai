import type {
  AssessmentId,
  AssessmentScoreId,
  CompositeScoreKey,
} from "../../shared";

export type AssessmentScoreEntry = {
  key: CompositeScoreKey;
  label: string;
  score: number;
  weight: number;
};

export type AssessmentScoreProps = {
  id: AssessmentScoreId;
  assessmentId: AssessmentId;
  entries: AssessmentScoreEntry[];
  overallScore: number;
  calculatedAt: string;
};

export class AssessmentScore {
  readonly id: AssessmentScoreId;
  readonly assessmentId: AssessmentId;
  readonly entries: AssessmentScoreEntry[];
  readonly overallScore: number;
  readonly calculatedAt: string;

  private constructor(props: AssessmentScoreProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.entries = props.entries.map((e) => ({ ...e }));
    this.overallScore = props.overallScore;
    this.calculatedAt = props.calculatedAt;
  }

  static create(
    props: Omit<AssessmentScoreProps, "id" | "calculatedAt" | "overallScore"> & {
      id?: AssessmentScoreId;
      calculatedAt?: string;
      overallScore?: number;
    },
  ): AssessmentScore {
    const overallScore =
      props.overallScore ??
      Math.round(
        props.entries.reduce((sum, e) => sum + e.score * e.weight, 0) /
          Math.max(props.entries.reduce((sum, e) => sum + e.weight, 0), 1),
      );
    return new AssessmentScore({
      id: props.id ?? `ascr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: props.assessmentId,
      entries: props.entries,
      overallScore,
      calculatedAt: props.calculatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AssessmentScoreProps {
    return {
      id: this.id,
      assessmentId: this.assessmentId,
      entries: this.entries.map((e) => ({ ...e })),
      overallScore: this.overallScore,
      calculatedAt: this.calculatedAt,
    };
  }
}
