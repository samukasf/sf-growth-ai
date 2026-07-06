import type { CompanyId, ExperienceId, Score, WisdomId } from "../../shared";
import { clampScore } from "../../shared";

export type ExecutiveExperienceProps = {
  id: ExperienceId;
  companyId: CompanyId;
  wisdomId?: WisdomId;
  title: string;
  context: string;
  actionTaken: string;
  result: string;
  successLevel: Score;
  recordedAt: string;
};

export class ExecutiveExperience {
  readonly id: ExperienceId;
  readonly companyId: CompanyId;
  readonly wisdomId?: WisdomId;
  readonly title: string;
  readonly context: string;
  readonly actionTaken: string;
  readonly result: string;
  readonly successLevel: Score;
  readonly recordedAt: string;

  private constructor(props: ExecutiveExperienceProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.wisdomId = props.wisdomId;
    this.title = props.title;
    this.context = props.context;
    this.actionTaken = props.actionTaken;
    this.result = props.result;
    this.successLevel = props.successLevel;
    this.recordedAt = props.recordedAt;
  }

  static create(
    props: Omit<ExecutiveExperienceProps, "id" | "recordedAt"> & {
      id?: ExperienceId;
      recordedAt?: string;
    },
  ): ExecutiveExperience {
    if (!props.title.trim()) {
      throw new Error("Executive experience title is required");
    }

    return new ExecutiveExperience({
      id: props.id ?? `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      wisdomId: props.wisdomId,
      title: props.title.trim(),
      context: props.context.trim(),
      actionTaken: props.actionTaken.trim(),
      result: props.result.trim(),
      successLevel: clampScore(props.successLevel),
      recordedAt: props.recordedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveExperienceProps {
    return {
      id: this.id,
      companyId: this.companyId,
      wisdomId: this.wisdomId,
      title: this.title,
      context: this.context,
      actionTaken: this.actionTaken,
      result: this.result,
      successLevel: this.successLevel,
      recordedAt: this.recordedAt,
    };
  }
}
