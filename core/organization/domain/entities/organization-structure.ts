import type { DepartmentId, OrganizationId, OrganizationStructureId } from "../../shared";

export type OrganizationStructureProps = {
  id: OrganizationStructureId;
  organizationId: OrganizationId;
  rootDepartmentId?: DepartmentId;
  departmentIds: DepartmentId[];
  version: number;
  updatedAt: string;
};

export class OrganizationStructure {
  readonly id: OrganizationStructureId;
  readonly organizationId: OrganizationId;
  readonly rootDepartmentId?: DepartmentId;
  readonly departmentIds: DepartmentId[];
  readonly version: number;
  readonly updatedAt: string;

  private constructor(props: OrganizationStructureProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.rootDepartmentId = props.rootDepartmentId;
    this.departmentIds = [...props.departmentIds];
    this.version = props.version;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<OrganizationStructureProps, "id" | "version" | "updatedAt"> & {
      id?: OrganizationStructureId;
      version?: number;
      updatedAt?: string;
    },
  ): OrganizationStructure {
    return new OrganizationStructure({
      id: props.id ?? `org-structure-${Date.now()}`,
      organizationId: props.organizationId,
      rootDepartmentId: props.rootDepartmentId,
      departmentIds: props.departmentIds,
      version: props.version ?? 1,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): OrganizationStructureProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      rootDepartmentId: this.rootDepartmentId,
      departmentIds: [...this.departmentIds],
      version: this.version,
      updatedAt: this.updatedAt,
    };
  }
}
