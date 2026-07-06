import type { CompanyId, LearningExperienceId, LearningRecordId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type LearningExperienceProps = {
  id: LearningExperienceId;
  companyId: CompanyId;
  recordId: LearningRecordId;
  title: string;
  context: string;
  actionTaken: string;
  resultSummary: string;
  successLevel: Score;
  recordedAt: string;
};

export class LearningExperience {
  readonly id: LearningExperienceId;
  readonly companyId: CompanyId;
  readonly recordId: LearningRecordId;
  readonly title: string;
  readonly context: string;
  readonly actionTaken: string;
  readonly resultSummary: string;
  readonly successLevel: Score;
  readonly recordedAt: string;

  private constructor(props: LearningExperienceProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.recordId = props.recordId;
    this.title = props.title;
    this.context = props.context;
    this.actionTaken = props.actionTaken;
    this.resultSummary = props.resultSummary;
    this.successLevel = props.successLevel;
    this.recordedAt = props.recordedAt;
  }

  static create(
    props: Omit<LearningExperienceProps, "id" | "recordedAt"> & {
      id?: LearningExperienceId;
      recordedAt?: string;
    },
  ): LearningExperience {
    if (!props.title.trim()) {
      throw new Error("Learning experience title is required");
    }

    return new LearningExperience({
      id: props.id ?? `experience-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      recordId: props.recordId,
      title: props.title.trim(),
      context: props.context.trim(),
      actionTaken: props.actionTaken.trim(),
      resultSummary: props.resultSummary.trim(),
      successLevel: clampScore(props.successLevel),
      recordedAt: props.recordedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): LearningExperienceProps {
    return {
      id: this.id,
      companyId: this.companyId,
      recordId: this.recordId,
      title: this.title,
      context: this.context,
      actionTaken: this.actionTaken,
      resultSummary: this.resultSummary,
      successLevel: this.successLevel,
      recordedAt: this.recordedAt,
    };
  }
}
