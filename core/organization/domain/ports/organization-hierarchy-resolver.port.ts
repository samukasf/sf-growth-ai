import type { OrganizationHierarchy, OrganizationMember } from "../entities";

export interface OrganizationHierarchyResolver {
  resolve(organizationId: string): Promise<OrganizationHierarchy | null>;
  getManagerChain(memberId: string): Promise<OrganizationMember[]>;
}
