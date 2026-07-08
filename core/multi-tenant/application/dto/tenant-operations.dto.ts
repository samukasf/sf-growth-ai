import type { AgencyId, OrganizationId, TenantId } from "../../shared";

export type CreateTenantDto = {
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: string;
  name: string;
  slug: string;
};

export type TenantScopeDto = {
  tenantId: TenantId;
};

export type ListTenantsDto = {
  agencyId: AgencyId;
};

export type ResolveTenantDto = {
  tenantId: TenantId;
};
