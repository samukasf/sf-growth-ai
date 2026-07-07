import type { DepartmentId, OrganizationId } from "../../shared";

export type DepartmentStatus = "active" | "inactive";

export type DepartmentProps = {
  id: DepartmentId;
  organizationId: OrganizationId;
  name: string;
  code: string;
  parentDepartmentId?: DepartmentId;
  headMemberId?: string;
  status: DepartmentStatus;
  createdAt: string;
};

export class Department {
  readonly id: DepartmentId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly code: string;
  readonly parentDepartmentId?: DepartmentId;
  readonly headMemberId?: string;
  readonly status: DepartmentStatus;
  readonly createdAt: string;

  private constructor(props: DepartmentProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.code = props.code;
    this.parentDepartmentId = props.parentDepartmentId;
    this.headMemberId = props.headMemberId;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<DepartmentProps, "id" | "createdAt" | "status"> & {
      id?: DepartmentId;
      createdAt?: string;
      status?: DepartmentStatus;
    },
  ): Department {
    return new Department({
      id: props.id ?? `dept-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      code: props.code.trim().toUpperCase(),
      parentDepartmentId: props.parentDepartmentId,
      headMemberId: props.headMemberId,
      status: props.status ?? "active",
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): DepartmentProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      code: this.code,
      parentDepartmentId: this.parentDepartmentId,
      headMemberId: this.headMemberId,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
