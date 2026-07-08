import type { ClientExecutiveStackProps } from "../../domain";
import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveContextPort,
  ExecutiveCouncilPort,
  ExecutiveCRMPort,
  ExecutiveDashboardPort,
  ExecutiveMemoryPort,
  ExecutiveTimelinePort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable() {
    return false;
  }
  async provisionForClient(_organizationId: string, _agencyId: string, _companyId: string) {
    return { companyBrainId: "" };
  }
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async registerAgencyClient(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
  ) {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async provisionCouncil(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async assignToClient(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveCRMAdapter implements ExecutiveCRMPort {
  isAvailable() {
    return false;
  }
  async registerClientAccount(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
    _clientName: string,
  ) {}
}

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable() {
    return false;
  }
  async prepareClientChannels(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
  ) {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async prepareClientAutomations(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
  ) {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async prepareClientWorkspace(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
  ) {}
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async provisionMemory(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveContextAdapter implements ExecutiveContextPort {
  isAvailable() {
    return false;
  }
  async provisionContext(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveTimelineAdapter implements ExecutiveTimelinePort {
  isAvailable() {
    return false;
  }
  async provisionTimeline(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveDashboardAdapter implements ExecutiveDashboardPort {
  isAvailable() {
    return false;
  }
  async provisionDashboard(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}
