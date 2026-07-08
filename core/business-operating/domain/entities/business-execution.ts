import type {
  AgencyId,
  BusinessExecutionId,
  BusinessExecutionStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessExecutionProps = {
  id: BusinessExecutionId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  operationId: string;
  activityId?: string;
  title: string;
  status: BusinessExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessExecution {
  readonly id: BusinessExecutionId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly operationId: string;
  readonly activityId?: string;
  readonly title: string;
  readonly status: BusinessExecutionStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly resultSummary?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessExecutionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.operationId = props.operationId;
    this.activityId = props.activityId;
    this.title = props.title;
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.resultSummary = props.resultSummary;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessExecutionProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: BusinessExecutionId;
      status?: BusinessExecutionStatus;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessExecution {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessExecution({
      id: props.id ?? `bexec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      operationId: props.operationId,
      activityId: props.activityId,
      title: props.title.trim(),
      status: props.status ?? "queued",
      startedAt: props.startedAt,
      completedAt: props.completedAt,
      resultSummary: props.resultSummary,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  start(): BusinessExecution {
    return BusinessExecution.create({
      ...this.toJSON(),
      status: "running",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  complete(resultSummary: string): BusinessExecution {
    return BusinessExecution.create({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
      resultSummary,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessExecutionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      operationId: this.operationId,
      activityId: this.activityId,
      title: this.title,
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      resultSummary: this.resultSummary,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
