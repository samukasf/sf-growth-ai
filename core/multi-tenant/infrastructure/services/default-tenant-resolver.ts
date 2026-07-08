import type { Tenant, TenantIsolationEngine, TenantRegistry, TenantRepository, TenantResolver } from "../../domain";
import { TenantIsolationError } from "../../shared";
import type { AgencyId, TenantId } from "../../shared";

export class DefaultTenantResolver implements TenantResolver {
  constructor(private readonly repository: TenantRepository) {}

  async resolve(tenantId: TenantId) {
    return this.repository.findTenant(tenantId);
  }

  async resolveBySlug(agencyId: AgencyId, slug: string) {
    return this.repository.findTenantBySlug(agencyId, slug);
  }

  async resolveScope(tenantId: TenantId) {
    const tenant = await this.repository.findTenant(tenantId);
    if (!tenant) return null;

    const workspace = await this.repository.findWorkspace(tenantId);
    return {
      organizationId: tenant.organizationId,
      agencyId: tenant.agencyId,
      tenantId: tenant.id,
      companyId: tenant.companyId,
      isolationKey: workspace?.isolationKey ?? `iso-${tenant.organizationId}-${tenant.agencyId}-${tenant.id}`,
    };
  }
}

export class DefaultTenantIsolationEngine implements TenantIsolationEngine {
  constructor(private readonly repository: TenantRepository) {}

  buildIsolationKey(tenant: Tenant): string {
    return `iso-${tenant.organizationId}-${tenant.agencyId}-${tenant.id}`;
  }

  async assertIsolated(tenantId: TenantId, resourceTenantId: TenantId): Promise<void> {
    if (tenantId !== resourceTenantId) {
      throw new TenantIsolationError(tenantId);
    }
  }

  async validateAccess(tenantId: TenantId, agencyId: AgencyId): Promise<boolean> {
    const tenant = await this.repository.findTenant(tenantId);
    return tenant?.agencyId === agencyId && tenant.status === "active";
  }
}

export class DefaultTenantRegistry implements TenantRegistry {
  constructor(private readonly repository: TenantRepository) {}

  async register(tenant: Tenant): Promise<void> {
    await this.repository.saveTenant(tenant);
  }

  async unregister(tenantId: TenantId): Promise<void> {
    await this.repository.deleteTenant(tenantId);
  }

  async listByAgency(agencyId: AgencyId) {
    return this.repository.listTenants(agencyId);
  }

  async get(tenantId: TenantId) {
    return this.repository.findTenant(tenantId);
  }
}
