import type {
  AgencyCorePort,
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveCRMPort,
  ExecutiveDashboardPort,
  ExecutiveMemoryPort,
  ExecutiveMissionsPort,
  ExecutiveTimelinePort,
} from "../../application/ports/integration";

export class NoopAgencyCoreAdapter implements AgencyCorePort {
  isAvailable() {
    return false;
  }
  async registerClient() {}
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable() {
    return false;
  }
  async activate() {
    return { companyBrainId: "" };
  }
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async assignToClient() {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async provisionCouncil() {}
}

export class NoopExecutiveCRMAdapter implements ExecutiveCRMPort {
  isAvailable() {
    return false;
  }
  async syncLead() {}
  async syncProposalAccepted() {}
}

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable() {
    return false;
  }
  async notifyClientEvent() {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async triggerLifecycleAutomation() {}
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async provisionMemory() {}
  async recordEvent() {}
}

export class NoopExecutiveTimelineAdapter implements ExecutiveTimelinePort {
  isAvailable() {
    return false;
  }
  async provisionTimeline() {}
  async appendEntry() {}
}

export class NoopExecutiveDashboardAdapter implements ExecutiveDashboardPort {
  isAvailable() {
    return false;
  }
  async provisionDashboard() {}
}

export class NoopExecutiveMissionsAdapter implements ExecutiveMissionsPort {
  isAvailable() {
    return false;
  }
  async provisionMissions() {}
}
