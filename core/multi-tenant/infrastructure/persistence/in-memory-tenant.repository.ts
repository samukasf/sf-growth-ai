import type {
  Tenant,
  TenantIdentity,
  TenantLimits,
  TenantRepository,
  TenantSettings,
  TenantSubscription,
  TenantWorkspace,
} from "../../domain";
import type { AgencyId, TenantId } from "../../shared";

export class InMemoryTenantRepository implements TenantRepository {
  private tenants = new Map<string, Tenant>();
  private workspaces = new Map<string, TenantWorkspace>();
  private settings = new Map<string, TenantSettings>();
  private identities = new Map<string, TenantIdentity>();
  private limits = new Map<string, TenantLimits>();
  private subscriptions = new Map<string, TenantSubscription>();

  async saveTenant(tenant: Tenant): Promise<void> {
    this.tenants.set(tenant.id, tenant);
  }

  async findTenant(tenantId: TenantId): Promise<Tenant | null> {
    return this.tenants.get(tenantId) ?? null;
  }

  async findTenantBySlug(agencyId: AgencyId, slug: string): Promise<Tenant | null> {
    return (
      [...this.tenants.values()].find(
        (tenant) => tenant.agencyId === agencyId && tenant.slug === slug,
      ) ?? null
    );
  }

  async listTenants(agencyId: AgencyId): Promise<Tenant[]> {
    return [...this.tenants.values()].filter(
      (tenant) => tenant.agencyId === agencyId && tenant.status !== "deleted",
    );
  }

  async deleteTenant(tenantId: TenantId): Promise<void> {
    this.tenants.delete(tenantId);
    this.workspaces.delete(tenantId);
    this.settings.delete(tenantId);
    this.identities.delete(tenantId);
    this.limits.delete(tenantId);
    this.subscriptions.delete(tenantId);
  }

  async saveWorkspace(workspace: TenantWorkspace): Promise<void> {
    this.workspaces.set(workspace.tenantId, workspace);
  }

  async findWorkspace(tenantId: TenantId): Promise<TenantWorkspace | null> {
    return this.workspaces.get(tenantId) ?? null;
  }

  async saveSettings(settings: TenantSettings): Promise<void> {
    this.settings.set(settings.tenantId, settings);
  }

  async findSettings(tenantId: TenantId): Promise<TenantSettings | null> {
    return this.settings.get(tenantId) ?? null;
  }

  async saveIdentity(identity: TenantIdentity): Promise<void> {
    this.identities.set(identity.tenantId, identity);
  }

  async findIdentity(tenantId: TenantId): Promise<TenantIdentity | null> {
    return this.identities.get(tenantId) ?? null;
  }

  async saveLimits(limits: TenantLimits): Promise<void> {
    this.limits.set(limits.tenantId, limits);
  }

  async findLimits(tenantId: TenantId): Promise<TenantLimits | null> {
    return this.limits.get(tenantId) ?? null;
  }

  async saveSubscription(subscription: TenantSubscription): Promise<void> {
    this.subscriptions.set(subscription.tenantId, subscription);
  }

  async findSubscription(tenantId: TenantId): Promise<TenantSubscription | null> {
    return this.subscriptions.get(tenantId) ?? null;
  }
}
