import { TenantHealth, TenantMetrics } from "../../domain";
import type { MultiTenantDependencies } from "../dependencies";
import type { CreateTenantDto } from "../dto";

export class CreateTenantUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(dto: CreateTenantDto) {
    const tenant = await this.deps.lifecycleManager.create(dto);
    return { tenant };
  }
}

export class ActivateTenantUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    const tenant = await this.deps.lifecycleManager.activate(tenantId);
    return { tenant };
  }
}

export class SuspendTenantUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    const tenant = await this.deps.lifecycleManager.suspend(tenantId);
    return { tenant };
  }
}

export class ArchiveTenantUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    const tenant = await this.deps.lifecycleManager.archive(tenantId);
    return { tenant };
  }
}

export class DeleteTenantUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    await this.deps.lifecycleManager.delete(tenantId);
  }
}

export class ResolveTenantUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    const tenant = await this.deps.resolver.resolve(tenantId);
    return { tenant };
  }
}

export class BuildTenantContextUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    const context = await this.deps.contextBuilder.build(tenantId);
    return { context };
  }
}

export class EvaluateTenantHealthUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    const tenant = await this.deps.resolver.resolve(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const subscription = await this.deps.repository.findSubscription(tenantId);
    const limits = await this.deps.repository.findLimits(tenantId);
    const settings = await this.deps.repository.findSettings(tenantId);

    const scores = {
      overall: tenant.status === "active" ? 85 : 40,
      isolation: 100,
      subscription: subscription?.status === "active" ? 90 : 50,
      limits: limits ? 80 : 30,
      executiveStack: settings ? 95 : 20,
    };

    const signals: string[] = [];
    if (tenant.status !== "active") signals.push(`status_${tenant.status}`);
    if (!subscription) signals.push("no_subscription");
    if (!limits) signals.push("no_limits");

    const health = TenantHealth.create({
      organizationId: tenant.organizationId,
      agencyId: tenant.agencyId,
      tenantId: tenant.id,
      scores,
      signals,
    });

    return { health };
  }
}

export class ComputeTenantMetricsUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(tenantId: string) {
    const tenant = await this.deps.resolver.resolve(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const metrics = TenantMetrics.create({
      organizationId: tenant.organizationId,
      agencyId: tenant.agencyId,
      tenantId: tenant.id,
      usage: {
        users: 0,
        projects: 0,
        storageGb: 0,
        apiCallsToday: 0,
      },
    });

    return { metrics };
  }
}

export class ListTenantsUseCase {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async execute(agencyId: string) {
    const tenants = await this.deps.registry.listByAgency(agencyId);
    return { tenants };
  }
}
