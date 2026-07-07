import type { CouncilId, CompanyId, CouncilSpecialistRole, OrganizationId } from "../../shared";

export type ExecutiveCouncilProps = {
  id: CouncilId;
  organizationId: OrganizationId;
  companyId: CompanyId;
  name: string;
  availableRoles: CouncilSpecialistRole[];
  createdAt: string;
};

export class ExecutiveCouncil {
  readonly id: CouncilId;
  readonly organizationId: OrganizationId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly availableRoles: CouncilSpecialistRole[];
  readonly createdAt: string;

  private constructor(props: ExecutiveCouncilProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.companyId = props.companyId;
    this.name = props.name;
    this.availableRoles = [...props.availableRoles];
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ExecutiveCouncilProps, "id" | "createdAt"> & {
      id?: CouncilId;
      createdAt?: string;
    },
  ): ExecutiveCouncil {
    return new ExecutiveCouncil({
      id: props.id ?? `council-${Date.now()}`,
      organizationId: props.organizationId,
      companyId: props.companyId,
      name: props.name,
      availableRoles: props.availableRoles,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveCouncilProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      companyId: this.companyId,
      name: this.name,
      availableRoles: [...this.availableRoles],
      createdAt: this.createdAt,
    };
  }
}
