export type LearningOutcomeStatus =
  | "success"
  | "partial"
  | "failure"
  | "pending"
  | "unknown";

export type LearningOutcomeProps = {
  status: LearningOutcomeStatus;
  description: string;
  measuredAt: string;
  metrics?: Record<string, number>;
};

export class LearningOutcome {
  readonly status: LearningOutcomeStatus;
  readonly description: string;
  readonly measuredAt: string;
  readonly metrics: Record<string, number>;

  private constructor(props: LearningOutcomeProps) {
    this.status = props.status;
    this.description = props.description.trim();
    this.measuredAt = props.measuredAt;
    this.metrics = props.metrics ?? {};
  }

  static create(props: LearningOutcomeProps): LearningOutcome {
    if (!props.description.trim()) {
      throw new Error("Learning outcome description is required");
    }

    return new LearningOutcome({
      status: props.status,
      description: props.description,
      measuredAt: props.measuredAt,
      metrics: props.metrics ?? {},
    });
  }

  toJSON(): LearningOutcomeProps {
    return {
      status: this.status,
      description: this.description,
      measuredAt: this.measuredAt,
      metrics: { ...this.metrics },
    };
  }
}
