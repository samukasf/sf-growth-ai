import type { OrganizationId } from "../../shared";
import type { Permission } from "../entities";
import type { PermissionAction, PermissionScope } from "../entities";

export interface PermissionRepository {
  save(permission: Permission): Promise<void>;
  findByOrganization(organizationId: OrganizationId): Promise<Permission[]>;
  findByScope(organizationId: OrganizationId, scope: PermissionScope): Promise<Permission[]>;
}

export type AccessCheckInput = {
  memberId: string;
  organizationId: OrganizationId;
  scope: PermissionScope;
  action: PermissionAction;
};

export interface AccessPolicyEngine {
  canAccess(input: AccessCheckInput): Promise<boolean>;
}
