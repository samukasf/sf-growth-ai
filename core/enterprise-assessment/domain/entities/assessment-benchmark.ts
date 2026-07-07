import type {
  AssessmentBenchmarkId,
  AssessmentDimensionKey,
  AssessmentId,
} from "../../shared";

export type BenchmarkEntry = {
  dimensionKey: AssessmentDimensionKey;
  companyScore: number;
  industryAverage: number;
  topQuartile: number;
  gap: number;
};

export type AssessmentBenchmarkProps = {
  id: AssessmentBenchmarkId;
  assessmentId: AssessmentId;
  industry: string;
  entries: BenchmarkEntry[];
  overallGap: number;
  calculatedAt: string;
};

export class AssessmentBenchmark {
  readonly id: AssessmentBenchmarkId;
  readonly assessmentId: AssessmentId;
  readonly industry: string;
  readonly entries: BenchmarkEntry[];
  readonly overallGap: number;
  readonly calculatedAt: string;

  private constructor(props: AssessmentBenchmarkProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.industry = props.industry;
    this.entries = props.entries.map((e) => ({ ...e }));
    this.overallGap = props.overallGap;
    this.calculatedAt = props.calculatedAt;
  }

  static create(
    props: Omit<AssessmentBenchmarkProps, "id" | "calculatedAt" | "overallGap"> & {
      id?: AssessmentBenchmarkId;
      calculatedAt?: string;
      overallGap?: number;
    },
  ): AssessmentBenchmark {
    const overallGap =
      props.overallGap ??
      Math.round(
        props.entries.reduce((sum, e) => sum + e.gap, 0) / Math.max(props.entries.length, 1),
      );
    return new AssessmentBenchmark({
      id: props.id ?? `abmk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: props.assessmentId,
      industry: props.industry,
      entries: props.entries,
      overallGap,
      calculatedAt: props.calculatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AssessmentBenchmarkProps {
    return {
      id: this.id,
      assessmentId: this.assessmentId,
      industry: this.industry,
      entries: this.entries.map((e) => ({ ...e })),
      overallGap: this.overallGap,
      calculatedAt: this.calculatedAt,
    };
  }
}
