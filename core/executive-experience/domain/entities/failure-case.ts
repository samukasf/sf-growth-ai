import type { CompanyId, ExperienceId, FailureCaseId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type FailureCaseProps = {
  id: FailureCaseId;
  companyId: CompanyId;
  experienceId: ExperienceId;
  title: string;
  description: string;
  rootCause: string;
  recurring: boolean;
  severity: Score;
  registeredAt: string;
};

export class FailureCase {
  readonly id: FailureCaseId;
  readonly companyId: CompanyId;
  readonly experienceId: ExperienceId;
  readonly title: string;
  readonly description: string;
  readonly rootCause: string;
  readonly recurring: boolean;
  readonly severity: Score;
  readonly registeredAt: string;

  private constructor(props: FailureCaseProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.experienceId = props.experienceId;
    this.title = props.title;
    this.description = props.description;
    this.rootCause = props.rootCause;
    this.recurring = props.recurring;
    this.severity = props.severity;
    this.registeredAt = props.registeredAt;
  }

  static create(
    props: Omit<FailureCaseProps, "id" | "registeredAt"> & {
      id?: FailureCaseId;
      registeredAt?: string;
    },
  ): FailureCase {
    return new FailureCase({
      id: props.id ?? `failure-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      experienceId: props.experienceId,
      title: props.title.trim(),
      description: props.description.trim(),
      rootCause: props.rootCause.trim(),
      recurring: props.recurring,
      severity: clampScore(props.severity),
      registeredAt: props.registeredAt ?? new Date().toISOString(),
    });
  }

  toJSON(): FailureCaseProps {
    return {
      id: this.id,
      companyId: this.companyId,
      experienceId: this.experienceId,
      title: this.title,
      description: this.description,
      rootCause: this.rootCause,
      recurring: this.recurring,
      severity: this.severity,
      registeredAt: this.registeredAt,
    };
  }
}
