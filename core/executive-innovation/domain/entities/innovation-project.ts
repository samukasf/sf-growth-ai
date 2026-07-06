import type {
  CompanyId,
  InnovationOpportunityId,
  InnovationProjectId,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";

export type InnovationProjectStatus = "planned" | "in_progress" | "completed" | "cancelled";

export type InnovationProjectProps = {
  id: InnovationProjectId;
  companyId: CompanyId;
  opportunityId: InnovationOpportunityId;
  title: string;
  description: string;
  status: InnovationProjectStatus;
  priority: Score;
  createdAt: string;
  updatedAt: string;
};

export class InnovationProject {
  readonly id: InnovationProjectId;
  readonly companyId: CompanyId;
  readonly opportunityId: InnovationOpportunityId;
  readonly title: string;
  readonly description: string;
  readonly status: InnovationProjectStatus;
  readonly priority: Score;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: InnovationProjectProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.priority = props.priority;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<InnovationProjectProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: InnovationProjectId;
      createdAt?: string;
      updatedAt?: string;
      status?: InnovationProjectStatus;
    },
  ): InnovationProject {
    const now = new Date().toISOString();
    return new InnovationProject({
      id: props.id ?? `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      title: props.title.trim(),
      description: props.description.trim(),
      status: props.status ?? "planned",
      priority: clampScore(props.priority),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): InnovationProjectProps {
    return {
      id: this.id,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
