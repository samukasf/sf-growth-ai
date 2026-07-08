import type {
  AgencyId,
  BusinessActivityId,
  BusinessActivityStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessActivityProps = {
  id: BusinessActivityId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  operationId?: string;
  routineId?: string;
  title: string;
  status: BusinessActivityStatus;
  assigneeId?: string;
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessActivity {
  readonly id: BusinessActivityId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly operationId?: string;
  readonly routineId?: string;
  readonly title: string;
  readonly status: BusinessActivityStatus;
  readonly assigneeId?: string;
  readonly dueAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessActivityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.operationId = props.operationId;
    this.routineId = props.routineId;
    this.title = props.title;
    this.status = props.status;
    this.assigneeId = props.assigneeId;
    this.dueAt = props.dueAt;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessActivityProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: BusinessActivityId;
      status?: BusinessActivityStatus;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessActivity {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessActivity({
      id: props.id ?? `bact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      operationId: props.operationId,
      routineId: props.routineId,
      title: props.title.trim(),
      status: props.status ?? "pending",
      assigneeId: props.assigneeId,
      dueAt: props.dueAt,
      completedAt: props.completedAt,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  complete(): BusinessActivity {
    return BusinessActivity.create({
      ...this.toJSON(),
      status: "done",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessActivityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      operationId: this.operationId,
      routineId: this.routineId,
      title: this.title,
      status: this.status,
      assigneeId: this.assigneeId,
      dueAt: this.dueAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
