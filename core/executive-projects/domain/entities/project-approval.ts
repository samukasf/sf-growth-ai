import type {
  CompanyId,
  ExecutiveProjectId,
  ProjectApprovalId,
} from "../../shared";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ProjectApprovalProps = {
  id: ProjectApprovalId;
  companyId: CompanyId;
  projectId: ExecutiveProjectId;
  title: string;
  justification: string;
  estimatedCost: number;
  estimatedROI: number;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt?: string;
};

export class ProjectApproval {
  readonly id: ProjectApprovalId;
  readonly companyId: CompanyId;
  readonly projectId: ExecutiveProjectId;
  readonly title: string;
  readonly justification: string;
  readonly estimatedCost: number;
  readonly estimatedROI: number;
  readonly status: ApprovalStatus;
  readonly requestedAt: string;
  readonly resolvedAt?: string;

  private constructor(props: ProjectApprovalProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.projectId = props.projectId;
    this.title = props.title;
    this.justification = props.justification;
    this.estimatedCost = props.estimatedCost;
    this.estimatedROI = props.estimatedROI;
    this.status = props.status;
    this.requestedAt = props.requestedAt;
    this.resolvedAt = props.resolvedAt;
  }

  static create(
    props: Omit<ProjectApprovalProps, "id" | "requestedAt" | "status"> & {
      id?: ProjectApprovalId;
      requestedAt?: string;
      status?: ApprovalStatus;
    },
  ): ProjectApproval {
    return new ProjectApproval({
      id: props.id ?? `proj-approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      projectId: props.projectId,
      title: props.title.trim(),
      justification: props.justification.trim(),
      estimatedCost: props.estimatedCost,
      estimatedROI: props.estimatedROI,
      status: props.status ?? "pending",
      requestedAt: props.requestedAt ?? new Date().toISOString(),
      resolvedAt: props.resolvedAt,
    });
  }

  approve(): ProjectApproval {
    return new ProjectApproval({
      ...this.toJSON(),
      status: "approved",
      resolvedAt: new Date().toISOString(),
    });
  }

  reject(): ProjectApproval {
    return new ProjectApproval({
      ...this.toJSON(),
      status: "rejected",
      resolvedAt: new Date().toISOString(),
    });
  }

  toJSON(): ProjectApprovalProps {
    return {
      id: this.id,
      companyId: this.companyId,
      projectId: this.projectId,
      title: this.title,
      justification: this.justification,
      estimatedCost: this.estimatedCost,
      estimatedROI: this.estimatedROI,
      status: this.status,
      requestedAt: this.requestedAt,
      resolvedAt: this.resolvedAt,
    };
  }
}
