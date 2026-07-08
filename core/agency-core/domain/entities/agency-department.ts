import type { AgencyDepartmentId, AgencyId, OrganizationId } from "../../shared";

export type AgencyDepartmentProps = {
  id: AgencyDepartmentId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  name: string;
  code: string;
  headEmployeeId?: string;
  createdAt: string;
};

export class AgencyDepartment {
  readonly id: AgencyDepartmentId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly name: string;
  readonly code: string;
  readonly headEmployeeId?: string;
  readonly createdAt: string;

  private constructor(props: AgencyDepartmentProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.name = props.name;
    this.code = props.code;
    this.headEmployeeId = props.headEmployeeId;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AgencyDepartmentProps, "id" | "createdAt"> & {
      id?: AgencyDepartmentId;
      createdAt?: string;
    },
  ): AgencyDepartment {
    return new AgencyDepartment({
      id: props.id ?? `adept-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      name: props.name.trim(),
      code: props.code.trim().toUpperCase(),
      headEmployeeId: props.headEmployeeId,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyDepartmentProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      name: this.name,
      code: this.code,
      headEmployeeId: this.headEmployeeId,
      createdAt: this.createdAt,
    };
  }
}
