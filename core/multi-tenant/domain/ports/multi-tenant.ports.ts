import type {
  Tenant,
  TenantContext,
  TenantHealth,
  TenantIdentity,
  TenantLimits,
  TenantMetrics,
  TenantSettings,
  TenantSubscription,
  TenantWorkspace,
} from "../entities";
import type { AgencyId, OrganizationId, TenantId } from "../../shared";

export interface TenantRepository {
  saveTenant(tenant: Tenant): Promise<void>;
  findTenant(tenantId: TenantId): Promise<Tenant | null>;
  findTenantBySlug(agencyId: AgencyId, slug: string): Promise<Tenant | null>;
  listTenants(agencyId: AgencyId): Promise<Tenant[]>;
  deleteTenant(tenantId: TenantId): Promise<void>;
  saveWorkspace(workspace: TenantWorkspace): Promise<void>;
  findWorkspace(tenantId: TenantId): Promise<TenantWorkspace | null>;
  saveSettings(settings: TenantSettings): Promise<void>;
  findSettings(tenantId: TenantId): Promise<TenantSettings | null>;
  saveIdentity(identity: TenantIdentity): Promise<void>;
  findIdentity(tenantId: TenantId): Promise<TenantIdentity | null>;
  saveLimits(limits: TenantLimits): Promise<void>;
  findLimits(tenantId: TenantId): Promise<TenantLimits | null>;
  saveSubscription(subscription: TenantSubscription): Promise<void>;
  findSubscription(tenantId: TenantId): Promise<TenantSubscription | null>;
}

export interface TenantResolver {
  resolve(tenantId: TenantId): Promise<Tenant | null>;
  resolveBySlug(agencyId: AgencyId, slug: string): Promise<Tenant | null>;
  resolveScope(tenantId: TenantId): Promise<{
    organizationId: OrganizationId;
    agencyId: AgencyId;
    tenantId: TenantId;
    companyId: string;
    isolationKey: string;
  } | null>;
}

export interface TenantContextBuilder {
  build(tenantId: TenantId): Promise<TenantContext>;
}

export interface TenantIsolationEngine {
  assertIsolated(tenantId: TenantId, resourceTenantId: TenantId): Promise<void>;
  buildIsolationKey(tenant: Tenant): string;
  validateAccess(tenantId: TenantId, agencyId: AgencyId): Promise<boolean>;
}

export interface TenantRegistry {
  register(tenant: Tenant): Promise<void>;
  unregister(tenantId: TenantId): Promise<void>;
  listByAgency(agencyId: AgencyId): Promise<Tenant[]>;
  get(tenantId: TenantId): Promise<Tenant | null>;
}

export interface TenantLifecycleManager {
  create(input: {
    organizationId: OrganizationId;
    agencyId: AgencyId;
    companyId: string;
    name: string;
    slug: string;
  }): Promise<Tenant>;
  activate(tenantId: TenantId): Promise<Tenant>;
  suspend(tenantId: TenantId): Promise<Tenant>;
  archive(tenantId: TenantId): Promise<Tenant>;
  delete(tenantId: TenantId): Promise<void>;
}

export interface TenantRuntime {
  createTenant(input: {
    organizationId: OrganizationId;
    agencyId: AgencyId;
    companyId: string;
    name: string;
    slug: string;
  }): Promise<Tenant>;
  activateTenant(tenantId: TenantId): Promise<Tenant>;
  suspendTenant(tenantId: TenantId): Promise<Tenant>;
  archiveTenant(tenantId: TenantId): Promise<Tenant>;
  deleteTenant(tenantId: TenantId): Promise<void>;
  resolveTenant(tenantId: TenantId): Promise<Tenant | null>;
  buildContext(tenantId: TenantId): Promise<TenantContext>;
  evaluateHealth(tenantId: TenantId): Promise<TenantHealth>;
  computeMetrics(tenantId: TenantId): Promise<TenantMetrics>;
  listTenants(agencyId: AgencyId): Promise<Tenant[]>;
}
