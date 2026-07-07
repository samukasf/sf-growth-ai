import { Permission, type PermissionRepository } from "../../domain";

export class InMemoryPermissionRepository implements PermissionRepository {
  private readonly permissions: Permission[] = [];

  async save(permission: Permission): Promise<void> {
    this.permissions.push(permission);
  }

  async findByOrganization(organizationId: string): Promise<Permission[]> {
    return this.permissions.filter((p) => p.organizationId === organizationId);
  }

  async findByScope(
    organizationId: string,
    scope: Permission["scope"],
  ): Promise<Permission[]> {
    return this.permissions.filter(
      (p) => p.organizationId === organizationId && p.scope === scope,
    );
  }
}
