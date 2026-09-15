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
  async registerTenantClient() {}
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async registerTenant() {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async assignToTenant() {}
}

export class NoopExecutiveOrchestratorAdapter implements ExecutiveOrchestratorPort {
  isAvailable() {
    return false;
  }
  async provisionTenantStack() {}
}

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable() {
    return false;
  }
  async prepareTenantChannels() {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async prepareTenantAutomations() {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async prepareTenantWorkspace() {}
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {
    return { companyBrainId: "" };
  }
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {}
}

export class NoopExecutiveTimelineAdapter implements ExecutiveTimelinePort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {}
}

export class NoopExecutiveDashboardAdapter implements ExecutiveDashboardPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {}
}

export class NoopExecutiveMissionsAdapter implements ExecutiveMissionsPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {}
}

export class NoopExecutiveOpportunitiesAdapter implements ExecutiveOpportunitiesPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {}
}

export class NoopExecutiveProjectsAdapter implements ExecutiveProjectsPort {
  isAvailable() {
    return false;
  }
  async provisionForTenant() {}
}
