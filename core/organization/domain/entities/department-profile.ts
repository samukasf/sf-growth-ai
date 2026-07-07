import type { DepartmentId, DepartmentProfileId, OrganizationId } from "../../shared";

export type DepartmentProfileProps = {
  id: DepartmentProfileId;
  organizationId: OrganizationId;
  departmentId: DepartmentId;
  description: string;
  objectives: string[];
  kpis: string[];
  budget?: number;
};

export class DepartmentProfile {
  readonly id: DepartmentProfileId;
  readonly organizationId: OrganizationId;
  readonly departmentId: DepartmentId;
  readonly description: string;
  readonly objectives: string[];
  readonly kpis: string[];
  readonly budget?: number;

  private constructor(props: DepartmentProfileProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.departmentId = props.departmentId;
    this.description = props.description;
    this.objectives = [...props.objectives];
    this.kpis = [...props.kpis];
    this.budget = props.budget;
  }

  static create(
    props: Omit<DepartmentProfileProps, "id"> & { id?: DepartmentProfileId },
  ): DepartmentProfile {
    return new DepartmentProfile({
      id: props.id ?? `dept-profile-${Date.now()}`,
      organizationId: props.organizationId,
      departmentId: props.departmentId,
      description: props.description.trim(),
      objectives: props.objectives,
      kpis: props.kpis,
      budget: props.budget,
    });
  }

  toJSON(): DepartmentProfileProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      departmentId: this.departmentId,
      description: this.description,
      objectives: [...this.objectives],
      kpis: [...this.kpis],
      budget: this.budget,
    };
  }
}
