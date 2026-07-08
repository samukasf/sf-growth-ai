import type { AgencyDepartmentId, AgencyEmployeeId, AgencyId, OrganizationId } from "../../shared";

export type AgencyEmployeeRole = "director" | "manager" | "specialist" | "analyst" | "coordinator";

export type AgencyEmployeeProps = {
  id: AgencyEmployeeId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  departmentId: AgencyDepartmentId;
  name: string;
  email: string;
  role: AgencyEmployeeRole;
  createdAt: string;
};

export class AgencyEmployee {
  readonly id: AgencyEmployeeId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly departmentId: AgencyDepartmentId;
  readonly name: string;
  readonly email: string;
  readonly role: AgencyEmployeeRole;
  readonly createdAt: string;

  private constructor(props: AgencyEmployeeProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.departmentId = props.departmentId;
    this.name = props.name;
    this.email = props.email;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AgencyEmployeeProps, "id" | "createdAt"> & {
      id?: AgencyEmployeeId;
      createdAt?: string;
    },
  ): AgencyEmployee {
    return new AgencyEmployee({
      id: props.id ?? `aemp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      departmentId: props.departmentId,
      name: props.name.trim(),
      email: props.email.trim().toLowerCase(),
      role: props.role,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyEmployeeProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      departmentId: this.departmentId,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}
