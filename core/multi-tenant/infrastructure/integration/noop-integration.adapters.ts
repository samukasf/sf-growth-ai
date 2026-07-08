import type { TenantExecutiveStackProps } from "../../domain";
import type {
  AgencyCorePort,
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveDashboardPort,
  ExecutiveMemoryPort,
  ExecutiveMissionsPort,
  ExecutiveOpportunitiesPort,
  ExecutiveOrchestratorPort,
  ExecutiveProjectsPort,
  ExecutiveTimelinePort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopAgencyCoreAdapter implements AgencyCorePort {
  isAvailable() {
    return false;
  }
  async registerTenantClient(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
    _tenantName: string,
  ) {}
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async registerTenant(
    _organizationId: string,
    _agencyId: string,
    _tenantId: string,
    _companyId: string,
  ) {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async assignToTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopExecutiveOrchestratorAdapter implements ExecutiveOrchestratorPort {
  isAvailable() {
    return false;
  }
  async provisionTenantStack(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable() {
    return false;
  }
  async prepareTenantChannels(
    _organizationId: string,
    _agencyId: string,
    _tenantId: string,
  ) {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async prepareTenantAutomations(
    _organizationId: string,
    _agencyId: string,
    _tenantId: string,
  ) {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async prepareTenantWorkspace(
    _organizationId: string,
    _agencyId: string,
    _tenantId: string,
  ) {}
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _agencyId: string,
    _tenantId: string,
    _companyId: string,
  ) {
    return { companyBrainId: "" };
  }
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopExecutiveTimelineAdapter implements ExecutiveTimelinePort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopExecutiveDashboardAdapter implements ExecutiveDashboardPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopExecutiveMissionsAdapter implements ExecutiveMissionsPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopExecutiveOpportunitiesAdapter implements ExecutiveOpportunitiesPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}

export class NoopExecutiveProjectsAdapter implements ExecutiveProjectsPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant(
    _organizationId: string,
    _tenantId: string,
    _executiveStack: TenantExecutiveStackProps,
  ) {}
}
