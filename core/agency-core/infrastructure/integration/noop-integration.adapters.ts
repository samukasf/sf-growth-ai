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
  async provisionForClient() {
    return { companyBrainId: "" };
  }
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async registerAgencyClient() {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async provisionCouncil() {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async assignToClient() {}
}

export class NoopExecutiveCRMAdapter implements ExecutiveCRMPort {
  isAvailable() {
    return false;
  }
  async registerClientAccount() {}
}

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable() {
    return false;
  }
  async prepareClientChannels() {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async prepareClientAutomations() {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async prepareClientWorkspace() {}
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async provisionMemory() {}
}

export class NoopExecutiveContextAdapter implements ExecutiveContextPort {
  isAvailable() {
    return false;
  }
  async provisionContext() {}
}

export class NoopExecutiveTimelineAdapter implements ExecutiveTimelinePort {
  isAvailable() {
    return false;
  }
  async provisionTimeline() {}
}

export class NoopExecutiveDashboardAdapter implements ExecutiveDashboardPort {
  isAvailable() {
    return false;
  }
  async provisionDashboard() {}
}
