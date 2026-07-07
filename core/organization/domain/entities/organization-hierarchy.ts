import type {
  DepartmentId,
  OrganizationHierarchyId,
  OrganizationId,
  OrganizationMemberId,
} from "../../shared";

export type HierarchyNode = {
  memberId: OrganizationMemberId;
  departmentId: DepartmentId;
  managerId?: OrganizationMemberId;
  level: number;
};

export type OrganizationHierarchyProps = {
  id: OrganizationHierarchyId;
  organizationId: OrganizationId;
  nodes: HierarchyNode[];
  maxDepth: number;
  updatedAt: string;
};

export class OrganizationHierarchy {
  readonly id: OrganizationHierarchyId;
  readonly organizationId: OrganizationId;
  readonly nodes: HierarchyNode[];
  readonly maxDepth: number;
  readonly updatedAt: string;

  private constructor(props: OrganizationHierarchyProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.nodes = props.nodes.map((n) => ({ ...n }));
    this.maxDepth = props.maxDepth;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<OrganizationHierarchyProps, "id" | "updatedAt"> & {
      id?: OrganizationHierarchyId;
      updatedAt?: string;
    },
  ): OrganizationHierarchy {
    return new OrganizationHierarchy({
      id: props.id ?? `org-hierarchy-${Date.now()}`,
      organizationId: props.organizationId,
      nodes: props.nodes,
      maxDepth: props.maxDepth,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): OrganizationHierarchyProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      nodes: this.nodes.map((n) => ({ ...n })),
      maxDepth: this.maxDepth,
      updatedAt: this.updatedAt,
    };
  }
}
