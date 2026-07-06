import type { CompanyId, LessonId, Score, WisdomId } from "../../shared";
import { clampScore } from "../../shared";

export type ExecutiveLessonProps = {
  id: LessonId;
  companyId: CompanyId;
  wisdomId: WisdomId;
  title: string;
  description: string;
  source: string;
  impact: Score;
  learnedAt: string;
};

export class ExecutiveLesson {
  readonly id: LessonId;
  readonly companyId: CompanyId;
  readonly wisdomId: WisdomId;
  readonly title: string;
  readonly description: string;
  readonly source: string;
  readonly impact: Score;
  readonly learnedAt: string;

  private constructor(props: ExecutiveLessonProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.wisdomId = props.wisdomId;
    this.title = props.title;
    this.description = props.description;
    this.source = props.source;
    this.impact = props.impact;
    this.learnedAt = props.learnedAt;
  }

  static create(
    props: Omit<ExecutiveLessonProps, "id" | "learnedAt"> & {
      id?: LessonId;
      learnedAt?: string;
    },
  ): ExecutiveLesson {
    return new ExecutiveLesson({
      id: props.id ?? `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      wisdomId: props.wisdomId,
      title: props.title.trim(),
      description: props.description.trim(),
      source: props.source.trim(),
      impact: clampScore(props.impact),
      learnedAt: props.learnedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveLessonProps {
    return {
      id: this.id,
      companyId: this.companyId,
      wisdomId: this.wisdomId,
      title: this.title,
      description: this.description,
      source: this.source,
      impact: this.impact,
      learnedAt: this.learnedAt,
    };
  }
}
