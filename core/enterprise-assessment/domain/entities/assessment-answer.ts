import type {
  AssessmentAnswerId,
  AssessmentId,
  AssessmentQuestionId,
} from "../../shared";

export type AssessmentAnswerProps = {
  id: AssessmentAnswerId;
  assessmentId: AssessmentId;
  questionId: AssessmentQuestionId;
  value: number;
  normalizedScore: number;
  notes?: string;
  answeredBy: string;
  answeredAt: string;
};

export class AssessmentAnswer {
  readonly id: AssessmentAnswerId;
  readonly assessmentId: AssessmentId;
  readonly questionId: AssessmentQuestionId;
  readonly value: number;
  readonly normalizedScore: number;
  readonly notes?: string;
  readonly answeredBy: string;
  readonly answeredAt: string;

  private constructor(props: AssessmentAnswerProps) {
    this.id = props.id;
    this.assessmentId = props.assessmentId;
    this.questionId = props.questionId;
    this.value = props.value;
    this.normalizedScore = props.normalizedScore;
    this.notes = props.notes;
    this.answeredBy = props.answeredBy;
    this.answeredAt = props.answeredAt;
  }

  static create(
    props: Omit<AssessmentAnswerProps, "id" | "answeredAt" | "normalizedScore"> & {
      id?: AssessmentAnswerId;
      answeredAt?: string;
      normalizedScore?: number;
    },
  ): AssessmentAnswer {
    const normalizedScore = props.normalizedScore ?? clampAnswer(props.value);
    return new AssessmentAnswer({
      id: props.id ?? `aans-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: props.assessmentId,
      questionId: props.questionId,
      value: props.value,
      normalizedScore,
      notes: props.notes,
      answeredBy: props.answeredBy,
      answeredAt: props.answeredAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AssessmentAnswerProps {
    return { ...this };
  }
}

function clampAnswer(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
