import type {
  Department,
  DepartmentProfile,
  DepartmentResolver,
  OrganizationHierarchy,
  OrganizationHierarchyResolver,
  OrganizationMember,
} from "../../domain";
import type { OrganizationRepository } from "../../domain";

export class DefaultDepartmentResolver implements DepartmentResolver {
  constructor(private readonly repository: OrganizationRepository) {}

  async resolveById(departmentId: string): Promise<Department | null> {
    return this.repository.findDepartmentById(departmentId);
  }

  async resolveProfile(departmentId: string): Promise<DepartmentProfile | null> {
    void departmentId;
    return null;
  }

  async resolveByOrganization(organizationId: string): Promise<Department[]> {
    return this.repository.findDepartmentsByOrganization(organizationId);
  }
}

export class DefaultOrganizationHierarchyResolver implements OrganizationHierarchyResolver {
  constructor(private readonly repository: OrganizationRepository) {}

  async resolve(organizationId: string): Promise<OrganizationHierarchy | null> {
    void organizationId;
    return null;
  }

  async getManagerChain(memberId: string): Promise<OrganizationMember[]> {
    const member = await this.repository.findMemberById(memberId);
    if (!member || !member.managerId) return [];

    const manager = await this.repository.findMemberById(member.managerId);
    return manager ? [manager] : [];
  }
}
