import type {
  AgencyId,
  BusinessRoutineId,
  BusinessRoutineStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessRoutineProps = {
  id: BusinessRoutineId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  title: string;
  frequency: "daily" | "weekly" | "monthly";
  status: BusinessRoutineStatus;
  scheduledAt: string;
  activityIds: string[];
  createdAt: string;
  updatedAt: string;
};

export class BusinessRoutine {
  readonly id: BusinessRoutineId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly frequency: "daily" | "weekly" | "monthly";
  readonly status: BusinessRoutineStatus;
  readonly scheduledAt: string;
  readonly activityIds: string[];
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessRoutineProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.frequency = props.frequency;
    this.status = props.status;
    this.scheduledAt = props.scheduledAt;
    this.activityIds = [...props.activityIds];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessRoutineProps, "id" | "createdAt" | "updatedAt" | "status" | "activityIds"> & {
      id?: BusinessRoutineId;
      status?: BusinessRoutineStatus;
      activityIds?: string[];
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessRoutine {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessRoutine({
      id: props.id ?? `brtn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      title: props.title.trim(),
      frequency: props.frequency,
      status: props.status ?? "draft",
      scheduledAt: props.scheduledAt,
      activityIds: props.activityIds ?? [],
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: BusinessRoutineStatus): BusinessRoutine {
    return BusinessRoutine.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessRoutineProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      title: this.title,
      frequency: this.frequency,
      status: this.status,
      scheduledAt: this.scheduledAt,
      activityIds: [...this.activityIds],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
