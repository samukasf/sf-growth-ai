import type {
  AgencyId,
  BusinessOperationId,
  BusinessOperationStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessOperationProps = {
  id: BusinessOperationId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  title: string;
  department: string;
  status: BusinessOperationStatus;
  ownerId?: string;
  scheduledFor: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessOperation {
  readonly id: BusinessOperationId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly title: string;
  readonly department: string;
  readonly status: BusinessOperationStatus;
  readonly ownerId?: string;
  readonly scheduledFor: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessOperationProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.title = props.title;
    this.department = props.department;
    this.status = props.status;
    this.ownerId = props.ownerId;
    this.scheduledFor = props.scheduledFor;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessOperationProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: BusinessOperationId;
      status?: BusinessOperationStatus;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessOperation {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new BusinessOperation({
      id: props.id ?? `bop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      title: props.title.trim(),
      department: props.department,
      status: props.status ?? "planned",
      ownerId: props.ownerId,
      scheduledFor: props.scheduledFor,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: BusinessOperationStatus): BusinessOperation {
    return BusinessOperation.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessOperationProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      title: this.title,
      department: this.department,
      status: this.status,
      ownerId: this.ownerId,
      scheduledFor: this.scheduledFor,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
