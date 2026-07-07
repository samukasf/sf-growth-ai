import type { DiscoveryQuestionnaireId, DiscoverySessionId } from "../../shared";

export type DiscoveryQuestion = {
  id: string;
  area: string;
  question: string;
  required: boolean;
  answer?: string;
  answeredAt?: string;
};

export type DiscoveryQuestionnaireProps = {
  id: DiscoveryQuestionnaireId;
  sessionId: DiscoverySessionId;
  title: string;
  questions: DiscoveryQuestion[];
  completionRate: number;
  createdAt: string;
  completedAt?: string;
};

export class DiscoveryQuestionnaire {
  readonly id: DiscoveryQuestionnaireId;
  readonly sessionId: DiscoverySessionId;
  readonly title: string;
  readonly questions: DiscoveryQuestion[];
  readonly completionRate: number;
  readonly createdAt: string;
  readonly completedAt?: string;

  private constructor(props: DiscoveryQuestionnaireProps) {
    this.id = props.id;
    this.sessionId = props.sessionId;
    this.title = props.title;
    this.questions = props.questions.map((q) => ({ ...q }));
    this.completionRate = props.completionRate;
    this.createdAt = props.createdAt;
    this.completedAt = props.completedAt;
  }

  static create(
    props: Omit<DiscoveryQuestionnaireProps, "id" | "createdAt" | "completionRate"> & {
      id?: DiscoveryQuestionnaireId;
      createdAt?: string;
      completionRate?: number;
    },
  ): DiscoveryQuestionnaire {
    return new DiscoveryQuestionnaire({
      id: props.id ?? `dqnr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: props.sessionId,
      title: props.title,
      questions: props.questions,
      completionRate: props.completionRate ?? 0,
      createdAt: props.createdAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
    });
  }

  withAnswer(questionId: string, answer: string): DiscoveryQuestionnaire {
    const questions = this.questions.map((q) =>
      q.id === questionId ? { ...q, answer, answeredAt: new Date().toISOString() } : q,
    );
    const answered = questions.filter((q) => q.answer).length;
    const completionRate = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;
    return DiscoveryQuestionnaire.create({
      ...this.toJSON(),
      questions,
      completionRate,
      completedAt: completionRate === 100 ? new Date().toISOString() : this.completedAt,
    });
  }

  toJSON(): DiscoveryQuestionnaireProps {
    return {
      id: this.id,
      sessionId: this.sessionId,
      title: this.title,
      questions: this.questions.map((q) => ({ ...q })),
      completionRate: this.completionRate,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
    };
  }
}
