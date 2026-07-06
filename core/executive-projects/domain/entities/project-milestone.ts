import type {
  CompanyId,
  ExecutiveProjectId,
  ProjectMilestoneId,
} from "../../shared";

export type MilestoneStatus = "pending" | "in_progress" | "completed";

export type ProjectMilestoneProps = {
  id: ProjectMilestoneId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  title: string;
  description: string;
  dueInDays: number;
  order: number;
  status: MilestoneStatus;
  deliverables: string[];
};

export class ProjectMilestone {
  readonly id: ProjectMilestoneId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly title: string;
  readonly description: string;
  readonly dueInDays: number;
  readonly order: number;
  readonly status: MilestoneStatus;
  readonly deliverables: string[];

  private constructor(props: ProjectMilestoneProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.dueInDays = props.dueInDays;
    this.order = props.order;
    this.status = props.status;
    this.deliverables = [...props.deliverables];
  }

  static create(
    props: Omit<ProjectMilestoneProps, "id" | "status"> & {
      id?: ProjectMilestoneId;
      status?: MilestoneStatus;
    },
  ): ProjectMilestone {
    return new ProjectMilestone({
      id: props.id ?? `milestone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      title: props.title.trim(),
      description: props.description.trim(),
      dueInDays: Math.max(1, props.dueInDays),
      order: props.order,
      status: props.status ?? "pending",
      deliverables: props.deliverables,
    });
  }

  toJSON(): ProjectMilestoneProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      title: this.title,
      description: this.description,
      dueInDays: this.dueInDays,
      order: this.order,
      status: this.status,
      deliverables: [...this.deliverables],
    };
  }
}
