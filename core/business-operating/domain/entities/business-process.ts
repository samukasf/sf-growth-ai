import type {
  AgencyId,
  BusinessProcessId,
  BusinessProcessStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type BusinessProcessProps = {
  id: BusinessProcessId;
  organizationId: OrganizationId;
  agencyId?: AgencyId;
  companyId: CompanyId;
  name: string;
  department: string;
  status: BusinessProcessStatus;
  stepCount: number;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
};

export class BusinessProcess {
  readonly id: BusinessProcessId;
  readonly organizationId: OrganizationId;
  readonly agencyId?: AgencyId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly department: string;
  readonly status: BusinessProcessStatus;
  readonly stepCount: number;
  readonly ownerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: BusinessProcessProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.name = props.name;
    this.department = props.department;
    this.status = props.status;
    this.stepCount = props.stepCount;
    this.ownerId = props.ownerId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<BusinessProcessProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: BusinessProcessId;
      status?: BusinessProcessStatus;
      createdAt?: string;
      updatedAt?: string;
    },
  ): BusinessProcess {
    if (!props.name.trim()) throw new Error("name is required");
    const now = new Date().toISOString();
    return new BusinessProcess({
      id: props.id ?? `bproc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      name: props.name.trim(),
      department: props.department,
      status: props.status ?? "draft",
      stepCount: props.stepCount,
      ownerId: props.ownerId,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: BusinessProcessStatus): BusinessProcess {
    return BusinessProcess.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessProcessProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      name: this.name,
      department: this.department,
      status: this.status,
      stepCount: this.stepCount,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
