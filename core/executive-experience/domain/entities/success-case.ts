import type { CompanyId, ExperienceId, Score, SuccessCaseId } from "../../shared";
import { clampScore } from "../../shared";

export type SuccessCaseProps = {
  id: SuccessCaseId;
  companyId: CompanyId;
  experienceId: ExperienceId;
  title: string;
  description: string;
  successLevel: Score;
  roi: number;
  reusableSolution: string;
  registeredAt: string;
};

export class SuccessCase {
  readonly id: SuccessCaseId;
  readonly companyId: CompanyId;
  readonly experienceId: ExperienceId;
  readonly title: string;
  readonly description: string;
  readonly successLevel: Score;
  readonly roi: number;
  readonly reusableSolution: string;
  readonly registeredAt: string;

  private constructor(props: SuccessCaseProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.experienceId = props.experienceId;
    this.title = props.title;
    this.description = props.description;
    this.successLevel = props.successLevel;
    this.roi = props.roi;
    this.reusableSolution = props.reusableSolution;
    this.registeredAt = props.registeredAt;
  }

  static create(
    props: Omit<SuccessCaseProps, "id" | "registeredAt"> & {
      id?: SuccessCaseId;
      registeredAt?: string;
    },
  ): SuccessCase {
    return new SuccessCase({
      id: props.id ?? `success-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      experienceId: props.experienceId,
      title: props.title.trim(),
      description: props.description.trim(),
      successLevel: clampScore(props.successLevel),
      roi: props.roi,
      reusableSolution: props.reusableSolution.trim(),
      registeredAt: props.registeredAt ?? new Date().toISOString(),
    });
  }

  toJSON(): SuccessCaseProps {
    return {
      id: this.id,
      companyId: this.companyId,
      experienceId: this.experienceId,
      title: this.title,
      description: this.description,
      successLevel: this.successLevel,
      roi: this.roi,
      reusableSolution: this.reusableSolution,
      registeredAt: this.registeredAt,
    };
  }
}
