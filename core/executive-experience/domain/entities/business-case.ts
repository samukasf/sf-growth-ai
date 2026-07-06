import type { BusinessCaseId, CompanyId, ExperienceId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type BusinessCaseStatus = "open" | "in_progress" | "completed" | "archived";

export type BusinessCaseProps = {
  id: BusinessCaseId;
  companyId: CompanyId;
  experienceId: ExperienceId;
  title: string;
  description: string;
  status: BusinessCaseStatus;
  expectedImpact: Score;
  createdAt: string;
  completedAt?: string;
};

export class BusinessCase {
  readonly id: BusinessCaseId;
  readonly companyId: CompanyId;
  readonly experienceId: ExperienceId;
  readonly title: string;
  readonly description: string;
  readonly status: BusinessCaseStatus;
  readonly expectedImpact: Score;
  readonly createdAt: string;
  readonly completedAt?: string;

  private constructor(props: BusinessCaseProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.experienceId = props.experienceId;
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.expectedImpact = props.expectedImpact;
    this.createdAt = props.createdAt;
    this.completedAt = props.completedAt;
  }

  static create(
    props: Omit<BusinessCaseProps, "id" | "createdAt" | "status"> & {
      id?: BusinessCaseId;
      createdAt?: string;
      status?: BusinessCaseStatus;
    },
  ): BusinessCase {
    return new BusinessCase({
      id: props.id ?? `case-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      experienceId: props.experienceId,
      title: props.title.trim(),
      description: props.description.trim(),
      status: props.status ?? "open",
      expectedImpact: clampScore(props.expectedImpact),
      createdAt: props.createdAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
    });
  }

  complete(): BusinessCase {
    return new BusinessCase({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessCaseProps {
    return {
      id: this.id,
      companyId: this.companyId,
      experienceId: this.experienceId,
      title: this.title,
      description: this.description,
      status: this.status,
      expectedImpact: this.expectedImpact,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
    };
  }
}
