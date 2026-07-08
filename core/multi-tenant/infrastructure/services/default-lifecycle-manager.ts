import {
  Tenant,
  TenantIdentity,
  TenantLimits,
  TenantSettings,
  TenantSubscription,
  TenantWorkspace,
  createTenantActivatedEvent,
  createTenantArchivedEvent,
  createTenantCreatedEvent,
  createTenantDeletedEvent,
  createTenantSuspendedEvent,
  type TenantLifecycleManager,
} from "../../domain";
import type { MultiTenantDependencies } from "../../application";
import { TenantNotFoundError } from "../../shared";

export class DefaultTenantLifecycleManager implements TenantLifecycleManager {
  constructor(private readonly deps: MultiTenantDependencies) {}

  async create(input: {
    organizationId: string;
    agencyId: string;
    companyId: string;
    name: string;
    slug: string;
  }) {
    const tenant = Tenant.create({
      organizationId: input.organizationId,
      agencyId: input.agencyId,
      companyId: input.companyId,
      name: input.name,
      slug: input.slug,
    });

    const workspace = TenantWorkspace.create({
      organizationId: input.organizationId,
      agencyId: input.agencyId,
      tenantId: tenant.id,
      name: `${tenant.name} Workspace`,
      timezone: "America/Sao_Paulo",
      locale: "pt-BR",
    });

    const settings = TenantSettings.create({
      organizationId: input.organizationId,
      agencyId: input.agencyId,
      tenantId: tenant.id,
    });

    const identity = TenantIdentity.create({
      organizationId: input.organizationId,
      agencyId: input.agencyId,
      tenantId: tenant.id,
      displayName: input.name,
    });

    const limits = TenantLimits.create({
      organizationId: input.organizationId,
      agencyId: input.agencyId,
      tenantId: tenant.id,
      maxUsers: 50,
      maxProjects: 20,
      maxStorageGb: 100,
      maxApiCallsPerDay: 10000,
    });

    const subscription = TenantSubscription.create({
      organizationId: input.organizationId,
      agencyId: input.agencyId,
      tenantId: tenant.id,
      plan: "starter",
    });

    await this.deps.repository.saveTenant(tenant);
    await this.deps.repository.saveWorkspace(workspace);
    await this.deps.repository.saveSettings(settings);
    await this.deps.repository.saveIdentity(identity);
    await this.deps.repository.saveLimits(limits);
    await this.deps.repository.saveSubscription(subscription);
    await this.deps.registry.register(tenant);
    await this.deps.eventDispatcher.publish(createTenantCreatedEvent(tenant));

    await this.provisionExecutiveStack(tenant);

    if (this.deps.agencyCore.isAvailable()) {
      await this.deps.agencyCore.registerTenantClient(
        tenant.organizationId,
        tenant.agencyId,
        tenant.companyId,
        tenant.name,
      );
    }

    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.registerTenant(
        tenant.organizationId,
        tenant.agencyId,
        tenant.id,
        tenant.companyId,
      );
    }

    return tenant;
  }

  async activate(tenantId: string) {
    const tenant = await this.requireTenant(tenantId);
    const activated = tenant.withStatus("active");
    await this.deps.repository.saveTenant(activated);
    await this.deps.eventDispatcher.publish(createTenantActivatedEvent(activated));
    return activated;
  }

  async suspend(tenantId: string) {
    const tenant = await this.requireTenant(tenantId);
    const suspended = tenant.withStatus("suspended");
    await this.deps.repository.saveTenant(suspended);
    await this.deps.eventDispatcher.publish(createTenantSuspendedEvent(suspended));
    return suspended;
  }

  async archive(tenantId: string) {
    const tenant = await this.requireTenant(tenantId);
    const archived = tenant.withStatus("archived");
    await this.deps.repository.saveTenant(archived);
    await this.deps.eventDispatcher.publish(createTenantArchivedEvent(archived));
    return archived;
  }

  async delete(tenantId: string) {
    const tenant = await this.requireTenant(tenantId);
    const deleted = tenant.withStatus("deleted");
    await this.deps.eventDispatcher.publish(createTenantDeletedEvent(deleted));
    await this.deps.registry.unregister(tenantId);
  }

  private async requireTenant(tenantId: string) {
    const tenant = await this.deps.repository.findTenant(tenantId);
    if (!tenant) throw new TenantNotFoundError(tenantId);
    return tenant;
  }

  private async provisionExecutiveStack(tenant: Tenant) {
    const stack = tenant.executiveStack;

    if (this.deps.companyBrain.isAvailable()) {
      await this.deps.companyBrain.provisionForTenant(
        tenant.organizationId,
        tenant.agencyId,
        tenant.id,
        tenant.companyId,
      );
    }

    if (this.deps.executiveOrchestrator.isAvailable()) {
      await this.deps.executiveOrchestrator.provisionTenantStack(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveMemory.isAvailable()) {
      await this.deps.executiveMemory.provisionForTenant(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveCouncil.isAvailable()) {
      await this.deps.executiveCouncil.provisionForTenant(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveTimeline.isAvailable()) {
      await this.deps.executiveTimeline.provisionForTenant(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveDashboard.isAvailable()) {
      await this.deps.executiveDashboard.provisionForTenant(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveMissions.isAvailable()) {
      await this.deps.executiveMissions.provisionForTenant(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveOpportunities.isAvailable()) {
      await this.deps.executiveOpportunities.provisionForTenant(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveProjects.isAvailable()) {
      await this.deps.executiveProjects.provisionForTenant(
        tenant.organizationId,
        tenant.id,
        stack,
      );
    }

    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.assignToTenant(tenant.organizationId, tenant.id, stack);
    }

    if (this.deps.businessCommunication.isAvailable()) {
      await this.deps.businessCommunication.prepareTenantChannels(
        tenant.organizationId,
        tenant.agencyId,
        tenant.id,
      );
    }

    if (this.deps.businessAutomation.isAvailable()) {
      await this.deps.businessAutomation.prepareTenantAutomations(
        tenant.organizationId,
        tenant.agencyId,
        tenant.id,
      );
    }

    if (this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.prepareTenantWorkspace(
        tenant.organizationId,
        tenant.agencyId,
        tenant.id,
      );
    }
  }
}
