import { TenantContext, type TenantContextBuilder, type TenantRepository } from "../../domain";
import type { TenantId } from "../../shared";

export class DefaultTenantContextBuilder implements TenantContextBuilder {
  constructor(private readonly repository: TenantRepository) {}

  async build(tenantId: TenantId): Promise<TenantContext> {
    const tenant = await this.repository.findTenant(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const workspace = await this.repository.findWorkspace(tenantId);
    const settings = await this.repository.findSettings(tenantId);
    const stack = tenant.executiveStack;

    return TenantContext.create({
      organizationId: tenant.organizationId,
      agencyId: tenant.agencyId,
      tenantId: tenant.id,
      isolationKey: workspace?.isolationKey ?? `iso-${tenant.organizationId}-${tenant.agencyId}-${tenant.id}`,
      operationalContext: {
        tenantName: tenant.name,
        status: tenant.status,
        agencyId: tenant.agencyId,
        companyId: tenant.companyId,
      },
      executiveContext: {
        companyBrainId: stack.companyBrainId,
        executiveMemoryId: stack.executiveMemoryId,
        executiveCouncilId: stack.executiveCouncilId,
        executiveTimelineId: stack.executiveTimelineId,
        executiveDashboardId: stack.executiveDashboardId,
        executiveMissionsId: stack.executiveMissionsId,
        executiveOpportunitiesId: stack.executiveOpportunitiesId,
        executiveProjectsId: stack.executiveProjectsId,
        featuresEnabled: String(Object.keys(settings?.features ?? {}).length),
      },
    });
  }
}
