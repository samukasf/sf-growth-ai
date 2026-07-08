import type {
  AgencyId,
  BusinessObjectiveId,
  BusinessObjectiveStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessObjectiveProps = {
  id: BusinessObjectiveId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  title: string;
  department: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: BusinessObjectiveStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessObjective {
  readonly id: BusinessObjectiveId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly department: string;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly unit: string;
  readonly status: BusinessObjectiveStatus;
  readonly dueDate: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessObjectiveProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.department = props.department;
    this.targetValue = props.targetValue;
    this.currentValue = props.currentValue;
    this.unit = props.unit;
    this.status = props.status;
    this.dueDate = props.dueDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessObjectiveProps, "id" | "createdAt" | "updatedAt" | "status" | "currentValue"> & {
      id?: BusinessObjectiveId;
      status?: BusinessObjectiveStatus;
      currentValue?: number;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessObjective {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessObjective({
      id: props.id ?? `bobj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      title: props.title.trim(),
      department: props.department,
      targetValue: props.targetValue,
      currentValue: props.currentValue ?? 0,
      unit: props.unit,
      status: props.status ?? "planned",
      dueDate: props.dueDate,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  progressPercent(): number {
    if (this.targetValue === 0) return 0;
    return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
  }

  toJSON(): BusinessObjectiveProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      title: this.title,
      department: this.department,
      targetValue: this.targetValue,
      currentValue: this.currentValue,
      unit: this.unit,
      status: this.status,
      dueDate: this.dueDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
